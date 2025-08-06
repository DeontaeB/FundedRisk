/**
 * Circuit Breaker Implementation for PropRuleTracker
 * Prevents cascading failures by monitoring service health
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, blocking requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number    // Number of failures before opening
  successThreshold: number    // Number of successes to close from half-open
  timeout: number            // Timeout for function execution (ms)
  resetTimeout: number       // Time before trying half-open (ms)
  name?: string             // Circuit breaker name for logging
  onStateChange?: (state: CircuitState, name?: string) => void
}

export interface CircuitBreakerStats {
  state: CircuitState
  failureCount: number
  successCount: number
  totalRequests: number
  lastFailureTime?: Date
  nextAttemptTime?: Date
}

export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private totalRequests: number = 0
  private lastFailureTime?: Date
  private nextAttemptTime?: Date
  private timer?: NodeJS.Timeout
  private options: CircuitBreakerOptions

  constructor(
    private readonly fn: (...args: any[]) => Promise<T>,
    options: CircuitBreakerOptions
  ) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 5000,
      resetTimeout: options.resetTimeout ?? 30000,
      name: options.name,
      onStateChange: options.onStateChange
    }
  }

  async execute(...args: any[]): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
        this.options.onStateChange?.(this.state, this.options.name)
        console.log(`Circuit breaker ${this.options.name} transitioning to HALF_OPEN`)
      } else {
        throw new Error(`Circuit breaker ${this.options.name || 'unknown'} is OPEN`)
      }
    }

    return this.callFunction(...args)
  }

  private async callFunction(...args: any[]): Promise<T> {
    this.totalRequests++
    
    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(...args)
      
      // Success handling
      this.onSuccess()
      return result
      
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private async executeWithTimeout(...args: any[]): Promise<T> {
    return Promise.race([
      this.fn(...args),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Function timeout')), this.options.timeout)
      )
    ])
  }

  private onSuccess(): void {
    this.failureCount = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED
        this.successCount = 0
        this.clearTimer()
        this.options.onStateChange?.(this.state, this.options.name)
        console.log(`Circuit breaker ${this.options.name} is now CLOSED`)
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = new Date()
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Back to open on any failure in half-open state
      this.state = CircuitState.OPEN
      this.successCount = 0
      this.scheduleReset()
      this.options.onStateChange?.(this.state, this.options.name)
      console.log(`Circuit breaker ${this.options.name} failed in HALF_OPEN, back to OPEN`)
      
    } else if (this.failureCount >= this.options.failureThreshold) {
      // Open the circuit
      this.state = CircuitState.OPEN
      this.scheduleReset()
      this.options.onStateChange?.(this.state, this.options.name)
      console.log(`Circuit breaker ${this.options.name} is now OPEN (${this.failureCount} failures)`)
    }
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime ? new Date() >= this.nextAttemptTime : false
  }

  private scheduleReset(): void {
    this.nextAttemptTime = new Date(Date.now() + this.options.resetTimeout)
    this.clearTimer()
    
    this.timer = setTimeout(() => {
      if (this.state === CircuitState.OPEN) {
        console.log(`Circuit breaker ${this.options.name} reset timeout reached`)
      }
    }, this.options.resetTimeout)
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  // Public methods for monitoring
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.nextAttemptTime = undefined
    this.clearTimer()
    this.options.onStateChange?.(this.state, this.options.name)
    console.log(`Circuit breaker ${this.options.name} manually reset`)
  }

  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED
  }
}

// Factory function for common circuit breakers
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>()

  static createOrGet<T>(
    name: string, 
    fn: (...args: any[]) => Promise<T>, 
    options?: Partial<CircuitBreakerOptions>
  ): CircuitBreaker<T> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name)!
    }

    const defaultOptions: CircuitBreakerOptions = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 5000,
      resetTimeout: 30000,
      name,
      onStateChange: (state, breakerName) => {
        console.log(`[Circuit Breaker] ${breakerName} state changed to ${state}`)
      }
    }

    const breaker = new CircuitBreaker(fn, { ...defaultOptions, ...options })

    this.breakers.set(name, breaker)
    return breaker
  }

  static getStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {}
    
    Array.from(this.breakers.entries()).forEach(([name, breaker]) => {
      stats[name] = breaker.getStats()
    })
    
    return stats
  }

  static getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers)
  }

  static resetAll(): void {
    Array.from(this.breakers.values()).forEach(breaker => {
      breaker.reset()
    })
  }
}

// Pre-configured circuit breakers for common services
export const AlertServiceBreaker = CircuitBreakerFactory.createOrGet(
  'alert-service',
  async () => { throw new Error('Not implemented') },
  {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 10000,
    resetTimeout: 60000
  }
)

export const DatabaseBreaker = CircuitBreakerFactory.createOrGet(
  'database',
  async () => { throw new Error('Not implemented') },
  {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 5000,
    resetTimeout: 30000
  }
)

export const WebhookBreaker = CircuitBreakerFactory.createOrGet(
  'webhook-processing',
  async () => { throw new Error('Not implemented') },
  {
    failureThreshold: 10,
    successThreshold: 5,
    timeout: 15000,
    resetTimeout: 45000
  }
)