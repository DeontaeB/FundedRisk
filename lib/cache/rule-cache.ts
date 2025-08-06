/**
 * Rule Engine Caching System for PropRuleTracker
 * Provides high-performance caching for compliance rules and user data
 */

interface CacheOptions {
  ttl?: number // Time to live in seconds
  maxSize?: number // Maximum cache size
  compression?: boolean // Enable compression for large objects
}

interface CacheItem<T> {
  value: T
  expires: number
  hits: number
  created: number
  compressed?: boolean
}

export class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private hitCount = 0
  private missCount = 0
  private readonly maxSize: number
  private readonly defaultTTL: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
    this.defaultTTL = options.ttl || 300 // 5 minutes default
    
    // Clean expired items every minute
    setInterval(() => this.cleanup(), 60000)
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const expirationTime = now + (ttl || this.defaultTTL) * 1000

    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      expires: expirationTime,
      hits: 0,
      created: now
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.missCount++
      return null
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    item.hits++
    this.hitCount++
    return item.value
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    return item !== undefined && Date.now() <= item.expires
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  size(): number {
    return this.cache.size
  }

  stats() {
    const totalRequests = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) + '%' : '0%',
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (now > item.expires) {
        this.cache.delete(key)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      console.log(`Cache cleanup: removed ${cleanedCount} expired items`)
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.created < oldestTime) {
        oldestTime = item.created
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private estimateMemoryUsage(): string {
    let totalSize = 0
    
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      totalSize += key.length * 2 // String characters are 2 bytes
      totalSize += JSON.stringify(item.value).length * 2
      totalSize += 100 // Overhead for object structure
    })
    
    if (totalSize < 1024) return `${totalSize} B`
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
  }
}

export class RuleCache {
  private userRulesCache: MemoryCache
  private propFirmCache: MemoryCache
  private complianceResultsCache: MemoryCache
  private userDataCache: MemoryCache

  constructor() {
    this.userRulesCache = new MemoryCache({ ttl: 600, maxSize: 500 }) // 10 minutes
    this.propFirmCache = new MemoryCache({ ttl: 3600, maxSize: 100 }) // 1 hour
    this.complianceResultsCache = new MemoryCache({ ttl: 60, maxSize: 1000 }) // 1 minute
    this.userDataCache = new MemoryCache({ ttl: 300, maxSize: 1000 }) // 5 minutes
  }

  // User Rules Caching
  getUserRules(userId: string, accountId: string) {
    const key = `user_rules:${userId}:${accountId}`
    return this.userRulesCache.get(key)
  }

  setUserRules(userId: string, accountId: string, rules: any, ttl?: number) {
    const key = `user_rules:${userId}:${accountId}`
    this.userRulesCache.set(key, rules, ttl)
  }

  invalidateUserRules(userId: string, accountId?: string) {
    if (accountId) {
      const key = `user_rules:${userId}:${accountId}`
      this.userRulesCache.delete(key)
    } else {
      // Invalidate all rules for user
      const pattern = `user_rules:${userId}:`
      const keysToDelete = this.userRulesCache.keys().filter(key => key.startsWith(pattern))
      keysToDelete.forEach(key => this.userRulesCache.delete(key))
    }
  }

  // Prop Firm Data Caching
  getPropFirmData(firmId: string) {
    const key = `prop_firm:${firmId}`
    return this.propFirmCache.get(key)
  }

  setPropFirmData(firmId: string, data: any, ttl?: number) {
    const key = `prop_firm:${firmId}`
    this.propFirmCache.set(key, data, ttl)
  }

  // Compliance Results Caching (short-lived)
  getComplianceResult(userId: string, tradeHash: string) {
    const key = `compliance:${userId}:${tradeHash}`
    return this.complianceResultsCache.get(key)
  }

  setComplianceResult(userId: string, tradeHash: string, result: any, ttl: number = 60) {
    const key = `compliance:${userId}:${tradeHash}`
    this.complianceResultsCache.set(key, result, ttl)
  }

  // User Account Data Caching
  getUserAccountData(userId: string) {
    const key = `user_account:${userId}`
    return this.userDataCache.get(key)
  }

  setUserAccountData(userId: string, data: any, ttl?: number) {
    const key = `user_account:${userId}`
    this.userDataCache.set(key, data, ttl)
  }

  invalidateUserAccountData(userId: string) {
    const key = `user_account:${userId}`
    this.userDataCache.delete(key)
  }

  // Daily Trading Stats Caching
  getDailyStats(userId: string, date: string) {
    const key = `daily_stats:${userId}:${date}`
    return this.userDataCache.get(key)
  }

  setDailyStats(userId: string, date: string, stats: any, ttl: number = 3600) {
    const key = `daily_stats:${userId}:${date}`
    this.userDataCache.set(key, stats, ttl)
  }

  // Position Data Caching
  getCurrentPositions(userId: string) {
    const key = `positions:${userId}`
    return this.userDataCache.get(key)
  }

  setCurrentPositions(userId: string, positions: any, ttl: number = 30) {
    const key = `positions:${userId}`
    this.userDataCache.set(key, positions, ttl)
  }

  // Utility Methods
  generateTradeHash(userId: string, symbol: string, action: string, timestamp: string): string {
    const crypto = require('crypto')
    return crypto.createHash('md5')
      .update(`${userId}-${symbol}-${action}-${timestamp}`)
      .digest('hex')
  }

  // Cache warming - preload frequently accessed data
  async warmCache(userIds: string[]): Promise<void> {
    console.log(`Warming cache for ${userIds.length} users...`)
    
    // This would typically load data from database
    // For now, just log the warming process
    for (const userId of userIds) {
      console.log(`Cache warmed for user: ${userId}`)
    }
  }

  // Global cache statistics
  getGlobalStats() {
    return {
      userRules: this.userRulesCache.stats(),
      propFirms: this.propFirmCache.stats(),
      complianceResults: this.complianceResultsCache.stats(),
      userData: this.userDataCache.stats(),
      totalMemoryUsage: this.getTotalMemoryUsage()
    }
  }

  private getTotalMemoryUsage(): string {
    // This is a simplified calculation
    const stats = [
      this.userRulesCache.stats(),
      this.propFirmCache.stats(),
      this.complianceResultsCache.stats(),
      this.userDataCache.stats()
    ]

    let totalSize = 0
    stats.forEach(stat => {
      const sizeStr = stat.memoryUsage.toString()
      if (sizeStr.includes('KB')) {
        totalSize += parseFloat(sizeStr.replace(' KB', '')) * 1024
      } else if (sizeStr.includes('MB')) {
        totalSize += parseFloat(sizeStr.replace(' MB', '')) * 1024 * 1024
      } else {
        totalSize += parseFloat(sizeStr.replace(' B', ''))
      }
    })

    if (totalSize < 1024) return `${totalSize} B`
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
  }

  // Clear all caches
  clearAll(): void {
    this.userRulesCache.clear()
    this.propFirmCache.clear()
    this.complianceResultsCache.clear()
    this.userDataCache.clear()
    console.log('All caches cleared')
  }
}

// Singleton instance
export const ruleCache = new RuleCache()

// Cache middleware for Express routes
export const cacheMiddleware = (cache: MemoryCache, keyGenerator: (req: any) => string, ttl?: number) => {
  return (req: any, res: any, next: any) => {
    const key = keyGenerator(req)
    const cachedResult = cache.get(key)
    
    if (cachedResult) {
      res.json(cachedResult)
      return
    }
    
    // Store original send function
    const originalSend = res.json
    
    // Override send to cache the result
    res.json = function(data: any) {
      cache.set(key, data, ttl)
      originalSend.call(this, data)
    }
    
    next()
  }
}

// Cache decorator for functions
export const cached = (cache: MemoryCache, keyPrefix: string, ttl?: number) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value
    
    descriptor.value = async function(...args: any[]) {
      const key = `${keyPrefix}:${JSON.stringify(args)}`
      const cachedResult = cache.get(key)
      
      if (cachedResult !== null) {
        return cachedResult
      }
      
      const result = await method.apply(this, args)
      cache.set(key, result, ttl)
      return result
    }
    
    return descriptor
  }
}