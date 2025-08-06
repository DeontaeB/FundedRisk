/**
 * Secure Webhook Token Management for PropRuleTracker
 * Generates and manages secure webhook URLs with proper authentication
 */

import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface WebhookToken {
  token: string
  userId: string
  url: string
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  lastUsedAt?: Date
  usageCount: number
}

export class WebhookTokenManager {
  private static instance: WebhookTokenManager
  private readonly tokenLength = 32
  private readonly baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }

  static getInstance(): WebhookTokenManager {
    if (!WebhookTokenManager.instance) {
      WebhookTokenManager.instance = new WebhookTokenManager()
    }
    return WebhookTokenManager.instance
  }

  /**
   * Generate a cryptographically secure token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex')
  }

  /**
   * Generate a new webhook URL for a user
   */
  async generateWebhookUrl(userId: string, expirationDays?: number): Promise<string> {
    // Invalidate any existing active tokens for this user
    await this.invalidateUserTokens(userId)

    // Generate new secure token
    const token = this.generateSecureToken()
    const webhookUrl = `${this.baseUrl}/api/webhooks/secure/${token}`

    // Calculate expiration date if provided
    let expiresAt: Date | undefined
    if (expirationDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)
    }

    // Store token in database (we'll update the user's webhookUrl field)
    await prisma.user.update({
      where: { id: userId },
      data: { 
        webhookUrl: webhookUrl,
        updatedAt: new Date()
      }
    })

    // Also store in a separate webhook tokens table (if you want to create one)
    // This would allow for better token management and analytics
    console.log(`Generated webhook URL for user ${userId}: ${webhookUrl}`)

    return webhookUrl
  }

  /**
   * Validate a webhook token
   */
  async validateToken(token: string): Promise<{ isValid: boolean; userId?: string; user?: any }> {
    if (!token || token.length !== this.tokenLength * 2) { // hex string is 2x the byte length
      return { isValid: false }
    }

    try {
      // Find user with this webhook URL
      const webhookUrl = `${this.baseUrl}/api/webhooks/secure/${token}`
      const user = await prisma.user.findFirst({
        where: { 
          webhookUrl: webhookUrl 
        },
        include: {
          subscriptions: {
            where: { 
              status: { in: ['active', 'trialing'] }
            },
            take: 1
          },
          userAccounts: {
            where: { isActive: true }
          }
        }
      })

      if (!user) {
        return { isValid: false }
      }

      // Check if user has active subscription
      if (user.subscriptions.length === 0) {
        return { isValid: false }
      }

      // Update last used timestamp (optional - can be done in the webhook handler)
      // await this.updateTokenUsage(token)

      return { 
        isValid: true, 
        userId: user.id,
        user 
      }
    } catch (error) {
      console.error('Error validating webhook token:', error)
      return { isValid: false }
    }
  }

  /**
   * Invalidate all tokens for a user
   */
  async invalidateUserTokens(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        webhookUrl: null,
        updatedAt: new Date()
      }
    })

    console.log(`Invalidated webhook tokens for user ${userId}`)
  }

  /**
   * Update token usage statistics
   */
  async updateTokenUsage(token: string): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/api/webhooks/secure/${token}`
      
      // You could store usage stats in a separate table
      // For now, we'll just log the usage
      console.log(`Webhook token used: ${token}`)
      
      // In a full implementation, you might want to:
      // 1. Update last used timestamp
      // 2. Increment usage counter
      // 3. Track usage patterns for analytics
      
    } catch (error) {
      console.error('Error updating token usage:', error)
    }
  }

  /**
   * Get webhook token info for a user
   */
  async getUserWebhookInfo(userId: string): Promise<{
    hasActiveWebhook: boolean
    webhookUrl?: string
    createdAt?: Date
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          webhookUrl: true,
          updatedAt: true
        }
      })

      if (!user || !user.webhookUrl) {
        return { hasActiveWebhook: false }
      }

      return {
        hasActiveWebhook: true,
        webhookUrl: user.webhookUrl,
        createdAt: user.updatedAt
      }
    } catch (error) {
      console.error('Error getting webhook info:', error)
      return { hasActiveWebhook: false }
    }
  }

  /**
   * Regenerate webhook URL for a user
   */
  async regenerateWebhookUrl(userId: string, expirationDays?: number): Promise<string> {
    console.log(`Regenerating webhook URL for user ${userId}`)
    return await this.generateWebhookUrl(userId, expirationDays)
  }

  /**
   * Extract token from webhook URL
   */
  extractTokenFromUrl(webhookUrl: string): string | null {
    const match = webhookUrl.match(/\/api\/webhooks\/secure\/([a-f0-9]{64})$/)
    return match ? match[1] : null
  }

  /**
   * Validate webhook URL format
   */
  isValidWebhookUrl(url: string): boolean {
    const tokenPattern = /^https?:\/\/.+\/api\/webhooks\/secure\/[a-f0-9]{64}$/
    return tokenPattern.test(url)
  }

  /**
   * Generate webhook setup instructions for users
   */
  generateWebhookInstructions(webhookUrl: string): {
    tradingViewInstructions: string
    testCurl: string
    securityNotes: string[]
  } {
    return {
      tradingViewInstructions: `
1. Go to TradingView and create a new alert
2. In the "Notifications" tab, select "Webhook URL"
3. Enter this URL: ${webhookUrl}
4. Set your alert message format (JSON recommended):
   {
     "symbol": "{{ticker}}",
     "action": "{{strategy.order.action}}",
     "quantity": "{{strategy.order.contracts}}",
     "price": "{{close}}",
     "timestamp": "{{time}}"
   }
5. Save your alert and start trading!
      `.trim(),
      
      testCurl: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol": "ES",
    "action": "buy",
    "quantity": 1,
    "price": 4150.50,
    "timestamp": "${new Date().toISOString()}"
  }'`,
      
      securityNotes: [
        'Keep your webhook URL secret - anyone with this URL can send trades to your account',
        'Use HTTPS only - never share this URL over unsecured connections',
        'If you suspect your URL has been compromised, regenerate it immediately',
        'Monitor your webhook activity in the dashboard',
        'Set up proper position sizing and risk management rules before going live'
      ]
    }
  }

  /**
   * Clean up expired tokens (if using expiration)
   */
  async cleanupExpiredTokens(): Promise<number> {
    // In a full implementation with a tokens table, you would:
    // 1. Find all expired tokens
    // 2. Mark them as inactive
    // 3. Optionally remove the webhook URL from user records
    
    console.log('Cleaning up expired webhook tokens...')
    // Return number of cleaned tokens
    return 0
  }
}

// Rate limiting for webhook token operations
export class WebhookTokenRateLimit {
  private static attempts = new Map<string, { count: number; resetTime: number }>()
  private static readonly maxAttempts = 5
  private static readonly windowMs = 15 * 60 * 1000 // 15 minutes

  static canGenerateToken(userId: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(userId)

    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(userId, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false
    }

    userAttempts.count++
    return true
  }

  static getRemainingAttempts(userId: string): number {
    const userAttempts = this.attempts.get(userId)
    if (!userAttempts || Date.now() > userAttempts.resetTime) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - userAttempts.count)
  }

  static getResetTime(userId: string): Date | null {
    const userAttempts = this.attempts.get(userId)
    if (!userAttempts || Date.now() > userAttempts.resetTime) {
      return null
    }
    return new Date(userAttempts.resetTime)
  }
}

// Singleton instance
export const webhookTokenManager = WebhookTokenManager.getInstance()