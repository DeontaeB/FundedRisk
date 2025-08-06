import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ComplianceEngine, TradeAlert } from '@/lib/compliance/engine'
import { sendNotification } from '@/lib/notifications/sender'

const prisma = new PrismaClient()

// TradingView webhook format parser
function parseTradingViewAlert(payload: any): TradeAlert | null {
  try {
    // Handle different TradingView alert formats
    const message = payload.message || payload.text || JSON.stringify(payload)
    
    // Try to parse structured JSON first
    if (payload.action && payload.symbol) {
      return {
        symbol: payload.symbol,
        action: payload.action.toLowerCase(),
        quantity: parseFloat(payload.quantity) || 1,
        price: parseFloat(payload.price) || undefined,
        stopLoss: parseFloat(payload.stop_loss) || undefined,
        takeProfit: parseFloat(payload.take_profit) || undefined,
        timestamp: payload.timestamp || new Date().toISOString()
      }
    }

    // Parse text-based alerts (common TradingView format)
    const lines = message.split('\n').map((line: string) => line.trim())
    const alert: Partial<TradeAlert> = {
      timestamp: new Date().toISOString()
    }

    for (const line of lines) {
      const [key, value] = line.split(':').map((s: string) => s.trim())
      
      switch (key?.toLowerCase()) {
        case 'symbol':
          alert.symbol = value
          break
        case 'action':
        case 'side':
          alert.action = value.toLowerCase() as TradeAlert['action']
          break
        case 'quantity':
        case 'size':
          alert.quantity = parseFloat(value)
          break
        case 'price':
          alert.price = parseFloat(value)
          break
        case 'stop':
        case 'stop_loss':
          alert.stopLoss = parseFloat(value)
          break
        case 'target':
        case 'take_profit':
          alert.takeProfit = parseFloat(value)
          break
      }
    }

    // Validate required fields
    if (alert.symbol && alert.action && alert.quantity) {
      return alert as TradeAlert
    }

    return null
  } catch (error) {
    console.error('Error parsing TradingView alert:', error)
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const rawPayload = await request.json()

    console.log(`Webhook received for user ${userId}:`, rawPayload)

    // Verify user exists and has valid webhook URL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAccounts: {
          where: { isActive: true },
          include: {
            propFirmAccount: {
              include: {
                propFirm: true
              }
            }
          }
        },
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 404 }
      )
    }

    // Check if user has active subscription
    if (user.subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Please upgrade your account to use webhook monitoring',
          upgradeUrl: `${process.env.NEXTAUTH_URL}/pricing`
        },
        { status: 402 } // Payment Required
      )
    }

    if (user.userAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No active trading accounts found' },
        { status: 400 }
      )
    }

    // Parse the alert from TradingView
    const alert = parseTradingViewAlert(rawPayload)
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Unable to parse trading alert' },
        { status: 400 }
      )
    }

    // Create webhook event record
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        userId,
        userTradingAccountId: user.userAccounts[0].id, // Use first active account
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

    // Run compliance checks
    const complianceEngine = new ComplianceEngine(userId, user.userAccounts[0].id)
    const complianceResult = await complianceEngine.validateTrade(alert)

    // Log compliance checks
    await complianceEngine.logComplianceCheck(webhookEvent.id, complianceResult)

    // Update webhook event with compliance results
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: complianceResult.allowTrade ? 'processed' : 'rejected',
        isComplianceViolation: complianceResult.isViolation,
        processedAt: new Date()
      }
    })

    // Handle violations
    if (complianceResult.isViolation) {
      // Send notifications for violations
      for (const violation of complianceResult.violations) {
        if (violation.shouldBlock) {
          await sendNotification({
            userId,
            type: 'compliance_violation',
            title: '🚨 Trading Alert Blocked',
            message: `${violation.message} - Trade was automatically blocked.`,
            severity: violation.severity,
            channels: ['email', 'sms'] // Send both email and SMS for critical violations
          })

          // Create alert record
          await prisma.alert.create({
            data: {
              userId,
              type: 'violation',
              title: 'Trade Blocked - Compliance Violation',
              message: violation.message,
              severity: violation.severity,
              metadata: {
                webhookEventId: webhookEvent.id,
                symbol: alert.symbol,
                action: alert.action,
                ruleType: violation.ruleType
              }
            }
          })
        } else {
          // Send warning notifications
          await sendNotification({
            userId,
            type: 'compliance_warning',
            title: '⚠️ Trading Compliance Warning',
            message: violation.message,
            severity: violation.severity,
            channels: ['email'] // Email only for warnings
          })
        }
      }
    }

    // If trade is allowed, create trade record
    if (complianceResult.allowTrade) {
      const trade = await prisma.trade.create({
        data: {
          userId,
          userTradingAccountId: user.userAccounts[0].id,
          symbol: alert.symbol,
          side: alert.action.includes('buy') ? 'buy' : 'sell',
          quantity: alert.quantity,
          price: alert.price || 0,
          orderType: 'market',
          source: 'tradingview',
          tradingViewId: webhookEvent.id
        }
      })

      // Link trade to webhook event
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { tradeId: trade.id }
      })

      // Send success notification
      await sendNotification({
        userId,
        type: 'trade_executed',
        title: '✅ Trade Executed',
        message: `${alert.action.toUpperCase()} ${alert.quantity} ${alert.symbol} at ${alert.price || 'market price'}`,
        severity: 'info',
        channels: ['in_app'] // In-app notification only for successful trades
      })
    }

    return NextResponse.json({
      success: true,
      message: complianceResult.allowTrade 
        ? 'Trade processed successfully' 
        : 'Trade blocked due to compliance violation',
      allowTrade: complianceResult.allowTrade,
      violations: complianceResult.violations.length,
      warnings: complianceResult.warnings
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to test webhook URL
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    userId: params.userId,
    timestamp: new Date().toISOString()
  })
}