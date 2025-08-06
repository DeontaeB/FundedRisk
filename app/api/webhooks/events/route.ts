import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

// GET /api/webhooks/events - Get webhook events history
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)
    const source = url.searchParams.get('source') // 'tradingview', 'test', etc.
    const status = url.searchParams.get('status') // 'processed', 'failed', 'rejected'
    const symbol = url.searchParams.get('symbol')?.toUpperCase()

    // Build where clause
    const where: any = { userId: user.id }
    if (source) where.source = source
    if (status) where.status = status
    if (symbol) where.symbol = symbol

    // Get webhook events
    const events = await prisma.webhookEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        source: true,
        symbol: true,
        action: true,
        quantity: true,
        price: true,
        status: true,
        isComplianceViolation: true,
        processingError: true,
        createdAt: true,
        processedAt: true,
        rawPayload: true,
        trade: {
          select: {
            id: true,
            status: true,
            pnl: true,
            closedAt: true
          }
        }
      }
    })

    const totalEvents = await prisma.webhookEvent.count({ where })

    // Get summary statistics
    const stats = await prisma.webhookEvent.groupBy({
      by: ['status'],
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _count: {
        id: true
      }
    })

    const statusSummary = {
      processed: 0,
      failed: 0,
      rejected: 0,
      processing: 0
    }

    stats.forEach(stat => {
      if (stat.status in statusSummary) {
        statusSummary[stat.status as keyof typeof statusSummary] = stat._count.id
      }
    })

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        total: totalEvents,
        limit,
        offset,
        hasMore: offset + limit < totalEvents
      },
      summary: {
        last30Days: statusSummary,
        totalProcessed: statusSummary.processed,
        successRate: statusSummary.processed + statusSummary.failed > 0 ? 
          (statusSummary.processed / (statusSummary.processed + statusSummary.failed) * 100).toFixed(1) + '%' :
          'N/A'
      }
    })

  } catch (error) {
    console.error('Get webhook events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook events' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/webhooks/events - Clear webhook events history
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const olderThan = url.searchParams.get('olderThan') // ISO date string
    const source = url.searchParams.get('source')
    const status = url.searchParams.get('status')

    // Build where clause
    const where: any = { userId: user.id }
    if (olderThan) {
      where.createdAt = { lt: new Date(olderThan) }
    }
    if (source) where.source = source
    if (status) where.status = status

    // Delete webhook events (but keep last 100 for audit purposes)
    const deleteResult = await prisma.webhookEvent.deleteMany({
      where: {
        ...where,
        id: {
          notIn: (await prisma.webhookEvent.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: { id: true }
          })).map(e => e.id)
        }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Deleted ${deleteResult.count} webhook event(s)`
    })

  } catch (error) {
    console.error('Delete webhook events error:', error)
    return NextResponse.json(
      { error: 'Failed to clear webhook events' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}