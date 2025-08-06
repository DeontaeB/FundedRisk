import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-tradingview-signature')
    const secret = process.env.TRADINGVIEW_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Webhook signature required' }, { status: 401 })
    }

    const body = await req.text()
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const {
      symbol,
      action, // 'buy', 'sell', 'close'
      quantity,
      price,
      userId,
      timestamp,
      orderType = 'market'
    } = webhookData

    // Validate required fields
    if (!symbol || !action || !quantity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log webhook for debugging
    await prisma.webhookEvent.create({
      data: {
        userId,
        source: 'tradingview',
        rawPayload: JSON.parse(body),
        symbol,
        action,
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : null,
      },
    })

    // Process the webhook based on action
    let result
    switch (action.toLowerCase()) {
      case 'buy':
      case 'sell':
        result = await createTrade(userId, {
          symbol,
          side: action.toLowerCase(),
          quantity: parseFloat(quantity),
          price: price ? parseFloat(price) : null,
          orderType,
          source: 'tradingview',
          tradingViewId: `tv_${timestamp || Date.now()}`,
        })
        break

      case 'close':
        result = await closeTrade(userId, symbol, parseFloat(price || 0))
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${action} action processed successfully`,
      data: result 
    })

  } catch (error) {
    console.error('TradingView webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createTrade(userId: string, tradeData: any) {
  const trade = await prisma.trade.create({
    data: {
      userId,
      ...tradeData,
      status: 'open',
    },
  })

  // Check compliance rules
  const complianceService = require('@/server/services/compliance')
  await complianceService.checkTradeCompliance(userId, trade)

  return trade
}

async function closeTrade(userId: string, symbol: string, closePrice: number) {
  // Find the most recent open trade for this symbol
  const openTrade = await prisma.trade.findFirst({
    where: {
      userId,
      symbol,
      status: 'open',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!openTrade) {
    throw new Error(`No open position found for ${symbol}`)
  }

  // Calculate P&L
  const priceDiff = closePrice - openTrade.price
  const multiplier = openTrade.side === 'buy' ? 1 : -1
  const pnl = priceDiff * multiplier * openTrade.quantity

  // Update trade
  const updatedTrade = await prisma.trade.update({
    where: { id: openTrade.id },
    data: {
      status: 'closed',
      closePrice,
      pnl,
      closedAt: new Date(),
    },
  })

  return updatedTrade
}