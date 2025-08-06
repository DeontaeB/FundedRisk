import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateConfigSchema = z.object({
  regenerateToken: z.boolean().optional(),
  enabled: z.boolean().optional(),
  notificationSettings: z.object({
    emailOnViolation: z.boolean().optional(),
    smsOnViolation: z.boolean().optional(),
    emailOnSuccess: z.boolean().optional()
  }).optional()
})

// GET /api/webhooks/config - Get current webhook configuration
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Get user's webhook configuration
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        webhookUrl: true,
        isSetupComplete: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          take: 1
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Extract token from webhook URL
    const webhookToken = dbUser.webhookUrl ? 
      dbUser.webhookUrl.split('/').pop() : null

    // Get webhook statistics
    const [totalEvents, recentEvents, complianceViolations] = await Promise.all([
      // Total events
      prisma.webhookEvent.count({
        where: { userId: user.id }
      }),
      
      // Events in last 24 hours
      prisma.webhookEvent.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Compliance violations in last 7 days
      prisma.webhookEvent.count({
        where: {
          userId: user.id,
          isComplianceViolation: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      config: {
        webhookUrl: dbUser.webhookUrl,
        webhookToken,
        isConfigured: !!dbUser.webhookUrl,
        isSetupComplete: dbUser.isSetupComplete,
        hasActiveSubscription: dbUser.subscriptions.length > 0
      },
      statistics: {
        totalEvents,
        recentEvents,
        complianceViolations,
        isActive: recentEvents > 0
      },
      documentation: {
        webhookFormat: {
          url: dbUser.webhookUrl || `${process.env.NEXTAUTH_URL}/api/webhooks/secure/{your-token}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tradingview-signature': 'optional-signature-for-verification'
          },
          examplePayload: {
            symbol: 'NQ',
            action: 'buy', // or 'sell', 'close_long', 'close_short'
            quantity: 1,
            price: 15500.00,
            timestamp: new Date().toISOString(),
            stopLoss: 15400.00, // optional
            takeProfit: 15600.00 // optional
          }
        },
        tradingViewInstructions: [
          '1. Go to TradingView Alerts',
          '2. Create a new alert',
          '3. Set the webhook URL to your personal URL above',
          '4. Use JSON format for the message body',
          '5. Include required fields: symbol, action, quantity'
        ]
      }
    })

  } catch (error) {
    console.error('Get webhook config error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook configuration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/webhooks/config - Update webhook configuration
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { regenerateToken, enabled, notificationSettings } = updateConfigSchema.parse(body)

    // Get current user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        webhookUrl: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          take: 1
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (dbUser.subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Please upgrade your account to configure webhooks'
        },
        { status: 402 }
      )
    }

    const updateData: any = {}

    // Regenerate webhook token if requested
    if (regenerateToken) {
      const newToken = nanoid(32)
      updateData.webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/secure/${newToken}`
      updateData.isSetupComplete = true
    }

    // Enable/disable webhooks
    if (typeof enabled === 'boolean') {
      if (enabled && !dbUser.webhookUrl) {
        // Enabling webhooks but no URL exists, create one
        const newToken = nanoid(32)
        updateData.webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/secure/${newToken}`
        updateData.isSetupComplete = true
      } else if (!enabled) {
        // Disabling webhooks
        updateData.webhookUrl = null
        updateData.isSetupComplete = false
      }
    }

    // Update user configuration
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })
    }

    // Handle notification settings (would be stored in user preferences)
    if (notificationSettings) {
      // For now, we'll log this - in a real app you'd store in user preferences
      console.log('Notification settings update:', {
        userId: user.id,
        settings: notificationSettings
      })
    }

    // Get updated configuration
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        webhookUrl: true,
        isSetupComplete: true
      }
    })

    const webhookToken = updatedUser?.webhookUrl ? 
      updatedUser.webhookUrl.split('/').pop() : null

    return NextResponse.json({
      success: true,
      message: regenerateToken ? 'Webhook token regenerated successfully' : 
               enabled !== undefined ? (enabled ? 'Webhooks enabled' : 'Webhooks disabled') :
               'Configuration updated successfully',
      config: {
        webhookUrl: updatedUser?.webhookUrl,
        webhookToken,
        isConfigured: !!updatedUser?.webhookUrl,
        isSetupComplete: updatedUser?.isSetupComplete
      }
    })

  } catch (error) {
    console.error('Update webhook config error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update webhook configuration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/webhooks/config - Initialize webhook configuration for new users
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Check if user already has webhook configured
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        webhookUrl: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          take: 1
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (dbUser.subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Please upgrade your account to set up webhooks'
        },
        { status: 402 }
      )
    }

    if (dbUser.webhookUrl) {
      return NextResponse.json({
        success: true,
        message: 'Webhook already configured',
        config: {
          webhookUrl: dbUser.webhookUrl,
          webhookToken: dbUser.webhookUrl.split('/').pop(),
          isConfigured: true
        }
      })
    }

    // Generate new webhook token and URL
    const webhookToken = nanoid(32)
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/secure/${webhookToken}`

    // Update user with webhook configuration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        webhookUrl,
        isSetupComplete: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook configuration initialized successfully',
      config: {
        webhookUrl,
        webhookToken,
        isConfigured: true,
        isSetupComplete: true
      }
    })

  } catch (error) {
    console.error('Initialize webhook config error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize webhook configuration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}