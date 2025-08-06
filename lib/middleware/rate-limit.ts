import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  message?: any // Error message/response
  keyGenerator?: (req: NextRequest) => string // Function to generate rate limit key
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Array.from(store.entries()).forEach(([key, value]) => {
    if (now > value.resetTime) {
      store.delete(key)
    }
  })
}, 5 * 60 * 1000)

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const now = Date.now()
    const key = config.keyGenerator ? 
      config.keyGenerator(req) : 
      getClientIp(req) || 'anonymous'

    const current = store.get(key)
    
    if (!current || now > current.resetTime) {
      // New window or expired window
      store.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }

    if (current.count >= config.max) {
      // Rate limit exceeded
      const resetTime = Math.ceil((current.resetTime - now) / 1000)
      
      return NextResponse.json(
        config.message || {
          error: 'Too Many Requests',
          retryAfter: resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Retry-After': resetTime.toString()
          }
        }
      )
    }

    // Increment counter
    current.count++
    store.set(key, current)
    
    return null // Allow request
  }
}

function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to other headers
  return req.headers.get('cf-connecting-ip') || 
         req.headers.get('x-client-ip') || 
         null
}

// Specialized rate limiter for webhooks
export const webhookRateLimit = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // 10 requests per second per IP
  message: {
    error: 'Webhook rate limit exceeded',
    message: 'Too many webhook requests from this IP'
  }
})

// Specialized rate limiter for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'API rate limit exceeded',
    message: 'Too many API requests from this IP'
  }
})