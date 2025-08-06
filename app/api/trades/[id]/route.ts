import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateTradeSchema = z.object({
  closePrice: z.number().positive().optional(),
  status: z.enum(['open', 'closed', 'cancelled']).optional(),
  quantity: z.number().positive().optional(),
  price: z.number().positive().optional(),
})

// GET /api/trades/[id] - Get specific trade
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const trade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        userId: user.id
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
        },
        complianceChecks: true
      }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trade
    })

  } catch (error) {
    console.error('Get trade error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/trades/[id] - Update specific trade
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTradeSchema.parse(body)

    // First check if trade exists and belongs to user
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingTrade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Calculate new P&L if closing the trade
    let updateData: any = { ...validatedData }
    
    if (validatedData.closePrice && validatedData.status === 'closed') {
      const price = validatedData.price || existingTrade.price
      const quantity = validatedData.quantity || existingTrade.quantity
      const multiplier = existingTrade.side === 'buy' ? 1 : -1
      
      updateData.pnl = (validatedData.closePrice - price) * multiplier * quantity
      updateData.closedAt = new Date()
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Trade updated successfully',
      data: updatedTrade
    })

  } catch (error) {
    console.error('Update trade error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/trades/[id] - Delete specific trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Check if trade exists and belongs to user
    const trade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    await prisma.trade.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully'
    })

  } catch (error) {
    console.error('Delete trade error:', error)
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}