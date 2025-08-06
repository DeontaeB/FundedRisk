import { PrismaClient } from '@prisma/client'
import { createEmailService, EmailTemplateBuilder } from './email-service'
import { createSMSService, SMSMessageFormatter, PhoneNumberUtils, SMSRateLimit } from './sms-service'

const prisma = new PrismaClient()
const emailService = createEmailService()
const smsService = createSMSService()

export interface NotificationRequest {
  userId: string
  type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'minor' | 'major' | 'critical'
  channels: ('email' | 'sms' | 'in_app')[]
  metadata?: any
}

export async function sendNotification(request: NotificationRequest): Promise<void> {
  try {
    // Get user preferences and contact info
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        notificationPreferences: true
      }
    })

    if (!user) {
      console.error('User not found for notification:', request.userId)
      return
    }

    // Filter channels based on user preferences and availability
    const availableChannels = filterAvailableChannels(request.channels, user, request.severity)

    // Send to each available channel
    const sendPromises = availableChannels.map(channel => 
      sendToChannel(channel, request, user)
    )

    await Promise.allSettled(sendPromises)

  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

async function sendToChannel(
  channel: string, 
  request: NotificationRequest, 
  user: any
): Promise<void> {
  
  try {
    let success = false
    let errorMessage: string | undefined

    switch (channel) {
      case 'email':
        const emailResult = await sendEmail(request, user)
        success = emailResult.success
        errorMessage = emailResult.error
        break
      
      case 'sms':
        const smsResult = await sendSMS(request, user)
        success = smsResult.success
        errorMessage = smsResult.error
        break
      
      case 'in_app':
        await createInAppNotification(request)
        success = true
        break
    }

    // Log notification attempt
    await prisma.notification.create({
      data: {
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        channel,
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : undefined,
        metadata: success ? request.metadata : { 
          ...request.metadata, 
          error: errorMessage || 'Unknown error' 
        }
      }
    })

  } catch (error) {
    console.error(`Error sending ${channel} notification:`, error)
    
    // Log failed notification
    await prisma.notification.create({
      data: {
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        channel,
        status: 'failed',
        metadata: { 
          ...request.metadata, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })
  }
}

async function sendEmail(request: NotificationRequest, user: any): Promise<{success: boolean, error?: string}> {
  try {
    if (!user.email) {
      return { success: false, error: 'User email not available' }
    }

    // Build email using template builder
    const emailRequest = EmailTemplateBuilder.buildComplianceAlert(request)
    emailRequest.to = user.email

    // Send email using the email service
    const result = await emailService.send(emailRequest)
    
    if (result.success) {
      console.log(`✅ Email sent successfully to ${user.email}`)
    } else {
      console.error(`❌ Email failed for ${user.email}:`, result.error)
    }

    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error'
    console.error('Email service error:', error)
    return { success: false, error: errorMessage }
  }
}

async function sendSMS(request: NotificationRequest, user: any): Promise<{success: boolean, error?: string}> {
  try {
    if (!user.phone) {
      return { success: false, error: 'User phone number not available' }
    }

    // Format and validate phone number
    const formattedPhone = PhoneNumberUtils.formatPhoneNumber(user.phone)
    if (!formattedPhone || !PhoneNumberUtils.isValidE164(formattedPhone)) {
      return { success: false, error: 'Invalid phone number format' }
    }

    // Check rate limits
    const withinLimit = await SMSRateLimit.checkLimit(formattedPhone)
    if (!withinLimit) {
      return { success: false, error: 'SMS rate limit exceeded' }
    }

    // Format message for SMS
    const smsMessage = SMSMessageFormatter.formatComplianceAlert(request)

    // Send SMS using the SMS service
    const result = await smsService.send({
      to: formattedPhone,
      message: smsMessage
    })

    if (result.success) {
      console.log(`✅ SMS sent successfully to ${PhoneNumberUtils.formatForDisplay(formattedPhone)}`)
    } else {
      console.error(`❌ SMS failed for ${formattedPhone}:`, result.error)
    }

    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMS error'
    console.error('SMS service error:', error)
    return { success: false, error: errorMessage }
  }
}

async function createInAppNotification(request: NotificationRequest): Promise<void> {
  // Create in-app notification record (already handled by Alert model)
  await prisma.alert.create({
    data: {
      userId: request.userId,
      type: request.severity === 'info' ? 'info' : 'warning',
      title: request.title,
      message: request.message,
      severity: request.severity,
      metadata: request.metadata
    }
  })
}

// Filter channels based on user preferences and availability
function filterAvailableChannels(
  requestedChannels: string[], 
  user: any, 
  severity: string
): string[] {
  const availableChannels: string[] = []

  for (const channel of requestedChannels) {
    switch (channel) {
      case 'email':
        if (user.email) {
          availableChannels.push(channel)
        }
        break
      
      case 'sms':
        if (user.phone) {
          // Check if user allows SMS for this severity level
          const preferences = user.notificationPreferences || {}
          const allowSMS = preferences.smsEnabled !== false && 
                          (severity === 'critical' || severity === 'major' || preferences.smsForWarnings)
          
          if (allowSMS) {
            availableChannels.push(channel)
          }
        }
        break
      
      case 'in_app':
        // In-app notifications are always available
        availableChannels.push(channel)
        break
    }
  }

  return availableChannels
}

// Utility functions for different notification types
export async function sendWelcomeNotification(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    // Send welcome email
    const welcomeEmail = EmailTemplateBuilder.buildWelcomeEmail(userEmail, userName)
    const emailResult = await emailService.send(welcomeEmail)

    // Log the welcome notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'welcome',
        title: 'Welcome to FundedSafe',
        message: 'Welcome email sent',
        channel: 'email',
        status: emailResult.success ? 'sent' : 'failed',
        sentAt: emailResult.success ? new Date() : undefined,
        metadata: emailResult.success ? {} : { error: emailResult.error }
      }
    })

    console.log(`Welcome notification sent to ${userEmail}:`, emailResult.success ? '✅' : '❌')

  } catch (error) {
    console.error('Error sending welcome notification:', error)
  }
}

export async function sendTestNotification(userId: string, channel: 'email' | 'sms'): Promise<{success: boolean, error?: string}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        firstName: true
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const testRequest: NotificationRequest = {
      userId,
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification to verify your alert settings are working correctly.',
      severity: 'info',
      channels: [channel],
      metadata: { test: true }
    }

    if (channel === 'email') {
      return await sendEmail(testRequest, user)
    } else if (channel === 'sms') {
      return await sendSMS(testRequest, user)
    }

    return { success: false, error: 'Invalid channel' }

  } catch (error) {
    console.error('Error sending test notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Bulk notification sender for system-wide alerts
export async function sendBulkNotification(
  userIds: string[], 
  notification: Omit<NotificationRequest, 'userId'>
): Promise<void> {
  const batchSize = 10
  
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)
    
    const batchPromises = batch.map(userId => 
      sendNotification({ ...notification, userId })
    )
    
    await Promise.allSettled(batchPromises)
    
    // Small delay between batches to avoid overwhelming services
    if (i + batchSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}