import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const createTradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['buy', 'sell'], { message: 'Side must be buy or sell' }),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  closePrice: z.number().positive().optional(),
  orderType: z.enum(['market', 'limit', 'stop']).default('market'),
  status: z.enum(['open', 'closed', 'cancelled']).default('open'),
  source: z.enum(['manual', 'tradingview', 'api']).default('manual'),
  userTradingAccountId: z.string().optional(),
})

// GET /api/trades - Get user's trades
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')

    const where: any = { userId: user.id }
    if (status) where.status = status
    if (symbol) where.symbol = symbol.toUpperCase()

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          userTradingAccount: {
            include: {
              propFirmAccount: {
                include: {
                  propFirm: true
                }
              }
            }
          }
        }
      }),
      prisma.trade.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        trades,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get trades error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/trades - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTradeSchema.parse(body)

    // Calculate P&L if both entry and exit prices are provided
    let pnl = null
    if (validatedData.closePrice && validatedData.status === 'closed') {
      const multiplier = validatedData.side === 'buy' ? 1 : -1
      pnl = (validatedData.closePrice - validatedData.price) * multiplier * validatedData.quantity
    }

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        symbol: validatedData.symbol.toUpperCase(),
        side: validatedData.side,
        quantity: validatedData.quantity,
        price: validatedData.price,
        closePrice: validatedData.closePrice,
        orderType: validatedData.orderType,
        status: validatedData.status,
        pnl,
        source: validatedData.source,
        userTradingAccountId: validatedData.userTradingAccountId,
        closedAt: validatedData.status === 'closed' ? new Date() : null,
      },
      include: {
        userTradingAccount: {
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

    return NextResponse.json({
      success: true,
      message: 'Trade created successfully',
      data: trade
    }, { status: 201 })

  } catch (error) {
    console.error('Create trade error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}