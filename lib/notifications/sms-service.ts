import { NotificationRequest } from './sender'

// SMS service interface - can be implemented with different providers
export interface SMSProvider {
  send(request: SMSRequest): Promise<SMSResult>
}

export interface SMSRequest {
  to: string // Phone number in E.164 format
  message: string
  from?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

// Twilio implementation
export class TwilioSMSService implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.fromNumber = fromNumber
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    try {
      if (!this.accountSid || !this.authToken) {
        throw new Error('Twilio credentials not configured')
      }

      // Create basic auth header
      const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
      
      // Prepare form data
      const formData = new URLSearchParams()
      formData.append('To', request.to)
      formData.append('From', request.from || this.fromNumber)
      formData.append('Body', request.message)

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        }
      )

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          messageId: data.sid
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `Twilio API error: ${response.status} - ${errorData.message || 'Unknown error'}`
        }
      }

    } catch (error) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMS error'
      }
    }
  }
}

// Mock/Development SMS service
export class MockSMSService implements SMSProvider {
  async send(request: SMSRequest): Promise<SMSResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('📱 [MOCK SMS SERVICE]')
    console.log('To:', request.to)
    console.log('From:', request.from)
    console.log('Message:', request.message)
    console.log('---')

    return {
      success: true,
      messageId: `mock-sms-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }
  }
}

// SMS message formatter
export class SMSMessageFormatter {
  static formatComplianceAlert(notification: NotificationRequest): string {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      minor: '🔶',
      major: '🔴',
      critical: '🚨'
    }[notification.severity]

    const isViolation = notification.severity === 'critical' || notification.severity === 'major'
    
    let message = `${emoji} FundedSafe Alert\n\n${notification.title}\n\n`
    
    // Add key message points (SMS has character limits)
    const shortMessage = notification.message.length > 100 ? 
      notification.message.substring(0, 100) + '...' : 
      notification.message
    
    message += shortMessage

    if (isViolation) {
      message += '\n\n🚨 STOP TRADING IMMEDIATELY'
    }

    // Add metadata if available
    if (notification.metadata?.symbol) {
      message += `\n\nSymbol: ${notification.metadata.symbol}`
    }

    // Add link to dashboard (shortened)
    message += `\n\nView: ${process.env.NEXTAUTH_URL}/dashboard`

    // Ensure message is under SMS limits (160 characters for single SMS, 1600 for concatenated)
    if (message.length > 1500) {
      const baseMessage = `${emoji} FundedSafe: ${notification.title}. ${isViolation ? 'STOP TRADING IMMEDIATELY. ' : ''}Check dashboard: ${process.env.NEXTAUTH_URL}/dashboard`
      return baseMessage
    }

    return message
  }

  static formatWelcomeSMS(userName: string): string {
    return `🛡️ Welcome to FundedSafe, ${userName}! Your prop firm trading compliance monitoring is now active. Complete setup: ${process.env.NEXTAUTH_URL}/onboarding`
  }

  static formatTestMessage(): string {
    return `🧪 FundedSafe Test: Your SMS notifications are working correctly! This is a test message from your compliance monitoring system.`
  }

  static formatWebhookHealthAlert(issues: string[]): string {
    return `🔧 FundedSafe: Webhook issues detected - ${issues.slice(0, 2).join(', ')}. Check dashboard: ${process.env.NEXTAUTH_URL}/dashboard`
  }
}

// Phone number validation and formatting
export class PhoneNumberUtils {
  // Validate and format phone number to E.164 format
  static formatPhoneNumber(phone: string, countryCode: string = 'US'): string | null {
    if (!phone) return null

    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')

    // Handle different input formats
    if (digits.length === 10 && countryCode === 'US') {
      // US number without country code
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // US number with country code
      return `+${digits}`
    } else if (digits.startsWith('1') && digits.length > 11) {
      // Handle case where + might be missing
      return `+${digits}`
    } else if (digits.length >= 10) {
      // International number (assume it's complete)
      return `+${digits}`
    }

    return null // Invalid format
  }

  // Validate E.164 format
  static isValidE164(phone: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(phone)
  }

  // Format for display (US numbers only)
  static formatForDisplay(phone: string): string {
    if (!phone.startsWith('+1') || phone.length !== 12) {
      return phone // Return as-is for non-US numbers
    }

    const digits = phone.substring(2) // Remove +1
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
  }
}

// Rate limiting for SMS to prevent spam and reduce costs
export class SMSRateLimit {
  private static readonly limits = new Map<string, { count: number; resetTime: number }>()

  static async checkLimit(phoneNumber: string, maxPerHour: number = 5): Promise<boolean> {
    const now = Date.now()
    const hourAgo = now - (60 * 60 * 1000)
    
    const current = this.limits.get(phoneNumber)
    
    if (!current || now > current.resetTime) {
      // New hour or first message
      this.limits.set(phoneNumber, {
        count: 1,
        resetTime: now + (60 * 60 * 1000)
      })
      return true
    }

    if (current.count >= maxPerHour) {
      return false // Rate limit exceeded
    }

    // Increment counter
    current.count++
    this.limits.set(phoneNumber, current)
    return true
  }

  // Clean up expired entries periodically
  static cleanup(): void {
    const now = Date.now()
    Array.from(this.limits.entries()).forEach(([phone, data]) => {
      if (now > data.resetTime) {
        this.limits.delete(phone)
      }
    })
  }
}

// Factory function to create SMS service based on environment
export function createSMSService(): SMSProvider {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (accountSid && authToken && fromNumber && process.env.NODE_ENV === 'production') {
    return new TwilioSMSService(accountSid, authToken, fromNumber)
  } else {
    return new MockSMSService()
  }
}

// Clean up rate limits every hour
setInterval(() => {
  SMSRateLimit.cleanup()
}, 60 * 60 * 1000)