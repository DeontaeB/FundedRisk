import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ComplianceEngine, TradeAlert } from '@/lib/compliance/engine'
import { sendNotification } from '@/lib/notifications/sender'
import crypto from 'crypto'
import { rateLimit } from '@/lib/middleware/rate-limit'

const prisma = new PrismaClient()

// Rate limiting configuration
const webhookLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each IP to 10 requests per second
  message: { error: 'Too many webhook requests' }
})

// Webhook signature verification
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex')
  
  return signature === expectedSignature
}

// Enhanced TradingView webhook parser with validation
function parseTradingViewAlert(payload: any): TradeAlert | null {
  try {
    // Validate required fields
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload format')
    }

    const message = payload.message || payload.text || JSON.stringify(payload)
    
    // Try to parse structured JSON first
    if (payload.action && payload.symbol) {
      return {
        symbol: payload.symbol.toUpperCase(),
        action: payload.action.toLowerCase(),
        quantity: Math.abs(parseFloat(payload.quantity)) || 1,
        price: payload.price ? Math.abs(parseFloat(payload.price)) : undefined,
        stopLoss: payload.stop_loss ? Math.abs(parseFloat(payload.stop_loss)) : undefined,
        takeProfit: payload.take_profit ? Math.abs(parseFloat(payload.take_profit)) : undefined,
        timestamp: payload.timestamp || new Date().toISOString()
      }
    }

    // Parse text-based alerts with enhanced validation
    const lines = message.split('\n').map((line: string) => line.trim()).filter(Boolean)
    const alert: Partial<TradeAlert> = {
      timestamp: new Date().toISOString()
    }

    for (const line of lines) {
      const [key, value] = line.split(':').map((s: string) => s.trim())
      
      if (!key || !value) continue

      switch (key.toLowerCase()) {
        case 'symbol':
          alert.symbol = value.toUpperCase()
          break
        case 'action':
        case 'side':
          const action = value.toLowerCase()
          if (['buy', 'sell', 'close_long', 'close_short'].includes(action)) {
            alert.action = action as TradeAlert['action']
          }
          break
        case 'quantity':
        case 'size':
          const qty = parseFloat(value)
          if (qty > 0) alert.quantity = qty
          break
        case 'price':
          const price = parseFloat(value)
          if (price > 0) alert.price = price
          break
        case 'stop_loss':
        case 'stoploss':
          const stopLoss = parseFloat(value)
          if (stopLoss > 0) alert.stopLoss = stopLoss
          break
        case 'take_profit':
        case 'takeprofit':
          const takeProfit = parseFloat(value)
          if (takeProfit > 0) alert.takeProfit = takeProfit
          break
      }
    }

    // Validation: ensure required fields are present
    if (!alert.symbol || !alert.action) {
      throw new Error('Missing required fields: symbol and action')
    }

    return alert as TradeAlert
  } catch (error) {
    console.error('Failed to parse TradingView alert:', error)
    return null
  }
}

// Idempotency check to prevent duplicate processing
async function checkIdempotency(userId: string, alertData: TradeAlert): Promise<boolean> {
  const idempotencyKey = crypto
    .createHash('md5')
    .update(`${userId}-${alertData.symbol}-${alertData.action}-${alertData.timestamp}`)
    .digest('hex')

  const existing = await prisma.webhookEvent.findFirst({
    where: {
      userId,
      rawPayload: {
        path: ['idempotencyKey'],
        equals: idempotencyKey
      }
    },
    select: { id: true }
  })

  return !!existing
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await webhookLimiter(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const { token } = params
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 400 }
      )
    }

    // Verify webhook token and get user
    const user = await prisma.user.findFirst({
      where: { 
        webhookUrl: {
          endsWith: token
        }
      },
      include: {
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        userAccounts: {
          where: { isActive: true },
          include: {
            propFirmAccount: {
              include: {
                propFirm: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 404 }
      )
    }

    // Check subscription status
    if (user.subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Please upgrade your account to use webhook monitoring'
        },
        { status: 402 }
      )
    }

    // Check if user has active trading accounts
    if (user.userAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No active trading accounts found' },
        { status: 400 }
      )
    }

    // Get request body and verify signature
    const body = await request.text()
    const signature = request.headers.get('x-tradingview-signature') || 
                     request.headers.get('x-webhook-signature')
    
    if (process.env.TRADINGVIEW_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(body, signature || '', process.env.TRADINGVIEW_WEBHOOK_SECRET)) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    let rawPayload: any
    try {
      rawPayload = JSON.parse(body)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Parse and validate the alert
    const alert = parseTradingViewAlert(rawPayload)
    if (!alert) {
      return NextResponse.json(
        { error: 'Failed to parse TradingView alert' },
        { status: 400 }
      )
    }

    // Check for duplicate webhook (idempotency)
    const isDuplicate = await checkIdempotency(user.id, alert)
    if (isDuplicate) {
      return NextResponse.json({ 
        message: 'Webhook already processed',
        status: 'duplicate' 
      })
    }

    console.log(`Processing webhook for user ${user.id}:`, {
      symbol: alert.symbol,
      action: alert.action,
      quantity: alert.quantity,
      price: alert.price
    })

    // Create idempotency key for this webhook
    const idempotencyKey = crypto
      .createHash('md5')
      .update(`${user.id}-${alert.symbol}-${alert.action}-${alert.timestamp}`)
      .digest('hex')

    // Add idempotency key to raw payload
    rawPayload.idempotencyKey = idempotencyKey

    // Create webhook event record
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        userId: user.id,
        userTradingAccountId: user.userAccounts[0].id,
        source: 'tradingview',
        rawPayload: rawPayload,
        parsedData: JSON.parse(JSON.stringify(alert)),
        symbol: alert.symbol,
        action: alert.action,
        quantity: alert.quantity,
        price: alert.price,
        stopLoss: alert.stopLoss,
        takeProfit: alert.takeProfit,
        status: 'processing'
      }
    })

    // Initialize compliance engine
    const complianceEngine = new ComplianceEngine(user.id, user.userAccounts[0].id)
    
    // Run compliance check
    const complianceResult = await complianceEngine.validateTrade(alert)

    // Update webhook status based on compliance result
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: complianceResult.allowTrade ? 'processed' : 'rejected',
        isComplianceViolation: complianceResult.isViolation,
        processingError: complianceResult.isViolation ? 
          complianceResult.violations.map(v => v.message).join('; ') : null,
        processedAt: new Date()
      }
    })

    // Create trade record if compliance allows
    let trade = null
    if (complianceResult.allowTrade) {
      trade = await prisma.trade.create({
        data: {
          userId: user.id,
          userTradingAccountId: user.userAccounts[0].id,
          symbol: alert.symbol,
          side: alert.action,
          quantity: alert.quantity || 1,
          price: alert.price || 0,
          orderType: 'market',
          status: 'open',
          source: 'tradingview',
          tradingViewId: webhookEvent.id
        }
      })

      // Link trade to webhook event
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { tradeId: trade.id }
      })
    }

    // Send notifications for violations or warnings
    if (complianceResult.isViolation || complianceResult.warnings.length > 0) {
      const alertType = complianceResult.isViolation ? 'violation' : 'warning'
      const alertTitle = complianceResult.isViolation ? 
        '🚨 COMPLIANCE VIOLATION' : '⚠️ Risk Warning'
      
      const violationMessages = complianceResult.violations.map(v => v.message)
      const allMessages = [...violationMessages, ...complianceResult.warnings]
      
      await sendNotification({
        userId: user.id,
        type: alertType,
        title: alertTitle,
        message: allMessages.join('\n'),
        severity: complianceResult.isViolation ? 'critical' : 'warning',
        channels: ['in_app', 'email'],
        metadata: {
          webhookEventId: webhookEvent.id,
          symbol: alert.symbol,
          action: alert.action,
          ruleViolations: complianceResult.violations.length
        }
      })
    }

    // Send success response
    const response = {
      success: true,
      message: complianceResult.allowTrade ? 'Trade processed successfully' : 'Trade blocked by compliance rules',
      tradeId: trade?.id,
      webhookEventId: webhookEvent.id,
      complianceStatus: {
        allowed: complianceResult.allowTrade,
        violations: complianceResult.violations.length,
        warnings: complianceResult.warnings.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process webhook'
      },
      { status: 500 }
    )
  }
}