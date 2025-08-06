/**
 * Structured Logging and Monitoring System for PropRuleTracker
 * Provides comprehensive logging, metrics, and alerting capabilities
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  userId?: string
  tradeId?: string
  webhookId?: string
  symbol?: string
  action?: string
  ruleType?: string
  requestId?: string
  sessionId?: string
  clientIp?: string
  userAgent?: string
  duration?: number
  status?: number
  method?: string
  url?: string
  query?: Record<string, any>
  body?: any
  response?: any
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  performance?: {
    startTime: number
    endTime: number
    duration: number
    memory: NodeJS.MemoryUsage
  }
  business?: {
    complianceViolations?: number
    riskLevel?: string
    accountBalance?: number
    dailyPnL?: number
    positionSize?: number
  }
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelName: string
  message: string
  service: string
  version: string
  environment: string
  context: LogContext
  traceId?: string
  spanId?: string
}

export class Logger {
  private static instance: Logger
  private minLogLevel: LogLevel = LogLevel.INFO
  private logHandlers: Array<(entry: LogEntry) => void> = []
  private metrics = new Map<string, number>()
  private readonly serviceName: string
  private readonly version: string
  private readonly environment: string

  private constructor() {
    this.serviceName = 'prop-rule-tracker'
    this.version = process.env.npm_package_version || '1.0.0'
    this.environment = process.env.NODE_ENV || 'development'
    
    // Default console handler
    this.addHandler(this.consoleHandler.bind(this))
    
    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase()
    if (envLogLevel && LogLevel[envLogLevel as keyof typeof LogLevel] !== undefined) {
      this.minLogLevel = LogLevel[envLogLevel as keyof typeof LogLevel]
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  addHandler(handler: (entry: LogEntry) => void): void {
    this.logHandlers.push(handler)
  }

  setLogLevel(level: LogLevel): void {
    this.minLogLevel = level
  }

  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    if (level < this.minLogLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      service: this.serviceName,
      version: this.version,
      environment: this.environment,
      context: {
        ...context,
        hostname: process.env.HOSTNAME || 'localhost',
        pid: process.pid
      }
    }

    // Generate trace ID if not provided
    if (!entry.traceId) {
      entry.traceId = this.generateTraceId()
    }

    // Call all handlers
    this.logHandlers.forEach(handler => {
      try {
        handler(entry)
      } catch (error) {
        console.error('Error in log handler:', error)
      }
    })

    // Update metrics
    this.updateMetrics(level, context)
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context)
  }

  fatal(message: string, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context)
  }

  // Business-specific logging methods
  logTrade(userId: string, tradeData: any, context: LogContext = {}): void {
    this.info('Trade processed', {
      ...context,
      userId,
      symbol: tradeData.symbol,
      action: tradeData.action,
      quantity: tradeData.quantity,
      price: tradeData.price,
      business: {
        ...context.business
      }
    })
  }

  logComplianceCheck(userId: string, result: any, context: LogContext = {}): void {
    const level = result.isViolation ? LogLevel.WARN : LogLevel.INFO
    const message = result.isViolation ? 'Compliance violation detected' : 'Compliance check passed'
    
    this.log(level, message, {
      ...context,
      userId,
      business: {
        complianceViolations: result.violations?.length || 0,
        riskLevel: result.riskLevel,
        ...context.business
      }
    })
  }

  logWebhookReceived(userId: string, webhookData: any, context: LogContext = {}): void {
    this.info('Webhook received', {
      ...context,
      userId,
      webhookId: webhookData.id,
      symbol: webhookData.symbol,
      action: webhookData.action
    })
  }

  logPerformance(operation: string, duration: number, context: LogContext = {}): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      performance: {
        startTime: Date.now() - duration,
        endTime: Date.now(),
        duration,
        memory: process.memoryUsage()
      }
    })
  }

  logSecurityEvent(event: string, context: LogContext = {}): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      security: true
    })
  }

  // Request logging middleware
  createRequestLogger() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now()
      const requestId = this.generateRequestId()
      
      // Add request ID to request object
      req.requestId = requestId
      
      // Log incoming request
      this.info('HTTP Request', {
        requestId,
        method: req.method,
        url: req.url,
        clientIp: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        query: req.query,
        body: this.sanitizeBody(req.body)
      })

      // Override res.end to log response
      const originalEnd = res.end
      res.end = function(chunk: any, encoding: any) {
        const duration = Date.now() - startTime
        
        logger.info('HTTP Response', {
          requestId,
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration,
          userId: req.user?.id,
          performance: {
            startTime,
            endTime: Date.now(),
            duration,
            memory: process.memoryUsage()
          }
        })
        
        originalEnd.call(res, chunk, encoding)
      }
      
      next()
    }
  }

  // Metrics and monitoring
  incrementMetric(name: string, value: number = 1): void {
    const current = this.metrics.get(name) || 0
    this.metrics.set(name, current + value)
  }

  setMetric(name: string, value: number): void {
    this.metrics.set(name, value)
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics.entries())
  }

  // Health check logging
  logHealthCheck(component: string, status: 'healthy' | 'unhealthy', details?: any): void {
    const level = status === 'healthy' ? LogLevel.INFO : LogLevel.ERROR
    
    this.log(level, `Health check: ${component} is ${status}`, {
      component,
      status: status as any,
      details
    })
  }

  private consoleHandler(entry: LogEntry): void {
    const colorMap = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    }
    
    const resetColor = '\x1b[0m'
    const color = colorMap[entry.level] || ''
    
    if (this.environment === 'development') {
      // Pretty print for development
      console.log(
        `${color}[${entry.timestamp}] ${entry.levelName}${resetColor}: ${entry.message}`,
        entry.context.userId ? `(User: ${entry.context.userId})` : '',
        entry.context.error ? `\nError: ${entry.context.error.message}` : ''
      )
      
      if (entry.context.performance) {
        console.log(`  ⏱️  Duration: ${entry.context.performance.duration}ms`)
      }
      
      if (entry.context.business) {
        console.log(`  📊 Business:`, entry.context.business)
      }
    } else {
      // JSON format for production
      console.log(JSON.stringify(entry))
    }
  }

  private updateMetrics(level: LogLevel, context: LogContext): void {
    // Update log level metrics
    this.incrementMetric(`logs.${LogLevel[level].toLowerCase()}`)
    
    // Update business metrics
    if (context.userId) {
      this.incrementMetric('logs.with_user_id')
    }
    
    if (context.business?.complianceViolations && context.business.complianceViolations > 0) {
      this.incrementMetric('business.compliance_violations', context.business.complianceViolations)
    }
    
    if (context.error) {
      this.incrementMetric('errors.total')
      this.incrementMetric(`errors.${context.error.name?.toLowerCase() || 'unknown'}`)
    }
    
    if (context.performance) {
      // Track slow requests (>1000ms)
      if (context.performance.duration > 1000) {
        this.incrementMetric('performance.slow_requests')
      }
    }
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  private sanitizeBody(body: any): any {
    if (!body) return body
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
    const sanitized = { ...body }
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }
    
    return sanitized
  }
}

// Monitoring class for system metrics
export class SystemMonitor {
  private static instance: SystemMonitor
  private metrics = new Map<string, any>()
  private intervals: NodeJS.Timeout[] = []

  private constructor() {}

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor()
    }
    return SystemMonitor.instance
  }

  start(): void {
    // Monitor system resources every 30 seconds
    const systemInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 30000)
    
    // Monitor application metrics every 10 seconds
    const appInterval = setInterval(() => {
      this.collectApplicationMetrics()
    }, 10000)
    
    this.intervals.push(systemInterval, appInterval)
    
    logger.info('System monitoring started')
  }

  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    logger.info('System monitoring stopped')
  }

  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    this.metrics.set('system.memory.rss', memoryUsage.rss)
    this.metrics.set('system.memory.heapUsed', memoryUsage.heapUsed)
    this.metrics.set('system.memory.heapTotal', memoryUsage.heapTotal)
    this.metrics.set('system.memory.external', memoryUsage.external)
    this.metrics.set('system.cpu.user', cpuUsage.user)
    this.metrics.set('system.cpu.system', cpuUsage.system)
    this.metrics.set('system.uptime', process.uptime())
    
    // Log if memory usage is high
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
    if (heapUsedMB > 500) { // Alert if using more than 500MB
      logger.warn('High memory usage detected', {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      })
    }
  }

  private collectApplicationMetrics(): void {
    // These would typically come from your application
    // For now, we'll use dummy values
    this.metrics.set('app.activeConnections', 0) // Would be populated by WebSocket server
    this.metrics.set('app.totalRequests', logger.getMetrics()['logs.info'] || 0)
    this.metrics.set('app.errors', logger.getMetrics()['errors.total'] || 0)
    this.metrics.set('app.complianceViolations', logger.getMetrics()['business.compliance_violations'] || 0)
  }

  getMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics.entries())
  }

  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy', details: any } {
    const metrics = this.getMetrics()
    const memoryUsageMB = metrics['system.memory.heapUsed'] / 1024 / 1024
    const errorRate = metrics['app.errors'] / Math.max(metrics['app.totalRequests'], 1)
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const issues: string[] = []
    
    if (memoryUsageMB > 1000) {
      status = 'unhealthy'
      issues.push(`High memory usage: ${Math.round(memoryUsageMB)}MB`)
    } else if (memoryUsageMB > 500) {
      status = 'degraded'
      issues.push(`Elevated memory usage: ${Math.round(memoryUsageMB)}MB`)
    }
    
    if (errorRate > 0.1) {
      status = 'unhealthy'
      issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
    } else if (errorRate > 0.05) {
      status = 'degraded'
      issues.push(`Elevated error rate: ${(errorRate * 100).toFixed(2)}%`)
    }
    
    return {
      status,
      details: {
        memoryUsageMB: Math.round(memoryUsageMB),
        errorRate: (errorRate * 100).toFixed(2) + '%',
        uptime: Math.round(metrics['system.uptime']),
        issues
      }
    }
  }
}

// Singleton instances
export const logger = Logger.getInstance()
export const monitor = SystemMonitor.getInstance()

// Utility functions
export const withLogging = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string,
  context: LogContext = {}
): T => {
  return (async (...args: any[]) => {
    const startTime = Date.now()
    const requestId = logger['generateRequestId']()
    
    logger.info(`Starting ${operationName}`, { ...context, requestId })
    
    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime
      
      logger.info(`Completed ${operationName}`, {
        ...context,
        requestId,
        performance: {
          startTime,
          endTime: Date.now(),
          duration,
          memory: process.memoryUsage()
        }
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error(`Failed ${operationName}`, {
        ...context,
        requestId,
        error: {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        },
        performance: {
          startTime,
          endTime: Date.now(),
          duration,
          memory: process.memoryUsage()
        }
      })
      
      throw error
    }
  }) as T
}