/**
 * Enhanced Error Handling System for PropRuleTracker
 * Provides centralized error handling, logging, and recovery strategies
 */

import { CircuitBreaker } from './circuit-breaker'

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorContext {
  userId?: string
  tradeId?: string
  webhookId?: string
  symbol?: string
  action?: string
  request?: {
    method?: string
    url?: string
    headers?: Record<string, string>
    body?: any
  }
  timestamp: Date
  environment: string
  service: string
  version?: string
  additionalData?: Record<string, any>
}

export interface EnhancedError extends Error {
  code: string
  severity: ErrorSeverity
  category: ErrorCategory
  context: ErrorContext
  isRetryable: boolean
  retryCount?: number
  originalError?: Error
}

export class PropRuleTrackerError extends Error implements EnhancedError {
  public code: string
  public severity: ErrorSeverity
  public category: ErrorCategory
  public context: ErrorContext
  public isRetryable: boolean
  public retryCount?: number
  public originalError?: Error

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: Partial<ErrorContext>,
    isRetryable: boolean = false,
    originalError?: Error
  ) {
    super(message)
    this.name = 'PropRuleTrackerError'
    this.code = code
    this.severity = severity
    this.category = category
    this.isRetryable = isRetryable
    this.originalError = originalError

    this.context = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      service: 'prop-rule-tracker',
      version: process.env.npm_package_version || '1.0.0',
      ...context
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PropRuleTrackerError)
    }
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorCallbacks: Array<(error: EnhancedError) => void> = []
  private retryStrategies = new Map<string, (error: EnhancedError) => Promise<boolean>>()

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Register error callback
  onError(callback: (error: EnhancedError) => void): void {
    this.errorCallbacks.push(callback)
  }

  // Register retry strategy for specific error codes
  registerRetryStrategy(
    errorCode: string, 
    strategy: (error: EnhancedError) => Promise<boolean>
  ): void {
    this.retryStrategies.set(errorCode, strategy)
  }

  // Handle error with automatic classification and logging
  async handleError(error: Error | EnhancedError, context?: Partial<ErrorContext>): Promise<EnhancedError> {
    let enhancedError: EnhancedError

    if (error instanceof PropRuleTrackerError) {
      enhancedError = error
      if (context) {
        enhancedError.context = { ...enhancedError.context, ...context }
      }
    } else {
      enhancedError = this.enhanceError(error, context)
    }

    // Log the error
    this.logError(enhancedError)

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(enhancedError)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })

    // Attempt retry if applicable
    if (enhancedError.isRetryable) {
      const shouldRetry = await this.shouldRetry(enhancedError)
      if (shouldRetry) {
        enhancedError.retryCount = (enhancedError.retryCount || 0) + 1
        console.log(`Attempting retry ${enhancedError.retryCount} for error ${enhancedError.code}`)
      }
    }

    return enhancedError
  }

  private enhanceError(error: Error, context?: Partial<ErrorContext>): EnhancedError {
    const { code, severity, category, isRetryable } = this.classifyError(error)

    return new PropRuleTrackerError(
      error.message,
      code,
      severity,
      category,
      context || {},
      isRetryable,
      error
    )
  }

  private classifyError(error: Error): {
    code: string
    severity: ErrorSeverity
    category: ErrorCategory
    isRetryable: boolean
  } {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Authentication/Authorization errors
    if (message.includes('unauthorized') || message.includes('forbidden') || 
        message.includes('authentication') || message.includes('token')) {
      return {
        code: 'AUTH_ERROR',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHENTICATION,
        isRetryable: false
      }
    }

    // Rate limiting errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.RATE_LIMIT,
        isRetryable: true
      }
    }

    // Database errors
    if (message.includes('database') || message.includes('connection') || 
        message.includes('prisma') || name.includes('prisma')) {
      return {
        code: 'DATABASE_ERROR',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        isRetryable: true
      }
    }

    // Network/timeout errors
    if (message.includes('timeout') || message.includes('network') || 
        message.includes('fetch') || message.includes('connection')) {
      return {
        code: 'NETWORK_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        isRetryable: true
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || message.includes('format')) {
      return {
        code: 'VALIDATION_ERROR',
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.VALIDATION,
        isRetryable: false
      }
    }

    // External service errors
    if (message.includes('tradingview') || message.includes('twilio') || 
        message.includes('sendgrid') || message.includes('stripe')) {
      return {
        code: 'EXTERNAL_SERVICE_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.EXTERNAL_SERVICE,
        isRetryable: true
      }
    }

    // Default classification
    return {
      code: 'UNKNOWN_ERROR',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      isRetryable: false
    }
  }

  private logError(error: EnhancedError): void {
    const logData = {
      timestamp: error.context.timestamp.toISOString(),
      level: this.severityToLogLevel(error.severity),
      message: error.message,
      code: error.code,
      severity: error.severity,
      category: error.category,
      isRetryable: error.isRetryable,
      retryCount: error.retryCount,
      context: error.context,
      stack: error.stack
    }

    // In production, this would go to a proper logging service
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      console.error('[ERROR]', JSON.stringify(logData, null, 2))
    } else {
      console.warn('[WARNING]', JSON.stringify(logData, null, 2))
    }
  }

  private severityToLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW: return 'info'
      case ErrorSeverity.MEDIUM: return 'warn'
      case ErrorSeverity.HIGH: return 'error'
      case ErrorSeverity.CRITICAL: return 'fatal'
      default: return 'error'
    }
  }

  private async shouldRetry(error: EnhancedError): Promise<boolean> {
    // Check if we have a custom retry strategy
    const strategy = this.retryStrategies.get(error.code)
    if (strategy) {
      return await strategy(error)
    }

    // Default retry logic
    const maxRetries = this.getMaxRetries(error.category)
    const currentRetries = error.retryCount || 0

    if (currentRetries >= maxRetries) {
      return false
    }

    // Don't retry validation or auth errors
    if (!error.isRetryable) {
      return false
    }

    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, currentRetries), 30000)
    await new Promise(resolve => setTimeout(resolve, delay))

    return true
  }

  private getMaxRetries(category: ErrorCategory): number {
    switch (category) {
      case ErrorCategory.NETWORK: return 3
      case ErrorCategory.DATABASE: return 2
      case ErrorCategory.EXTERNAL_SERVICE: return 3
      case ErrorCategory.RATE_LIMIT: return 1
      default: return 0
    }
  }
}

// Utility functions for common error scenarios
export const createValidationError = (
  message: string, 
  context?: Partial<ErrorContext>
): PropRuleTrackerError => {
  return new PropRuleTrackerError(
    message,
    'VALIDATION_ERROR',
    ErrorSeverity.LOW,
    ErrorCategory.VALIDATION,
    context || {},
    false
  )
}

export const createAuthenticationError = (
  message: string = 'Authentication failed',
  context?: Partial<ErrorContext>
): PropRuleTrackerError => {
  return new PropRuleTrackerError(
    message,
    'AUTH_ERROR',
    ErrorSeverity.HIGH,
    ErrorCategory.AUTHENTICATION,
    context || {},
    false
  )
}

export const createRateLimitError = (
  message: string = 'Rate limit exceeded',
  context?: Partial<ErrorContext>
): PropRuleTrackerError => {
  return new PropRuleTrackerError(
    message,
    'RATE_LIMIT_EXCEEDED',
    ErrorSeverity.MEDIUM,
    ErrorCategory.RATE_LIMIT,
    context || {},
    true
  )
}

// Wrapper for adding circuit breaker and error handling to functions
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: Partial<ErrorContext> = {},
  circuitBreaker?: CircuitBreaker
): T => {
  const errorHandler = ErrorHandler.getInstance()
  
  return (async (...args: any[]) => {
    try {
      if (circuitBreaker) {
        return await circuitBreaker.execute(...args)
      } else {
        return await fn(...args)
      }
    } catch (error) {
      const enhancedError = await errorHandler.handleError(error as Error, context)
      throw enhancedError
    }
  }) as T
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance()