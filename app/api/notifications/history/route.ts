import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

// GET /api/notifications/history - Get user notification history
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)
    const channel = url.searchParams.get('channel') // 'email', 'sms', 'in_app'
    const status = url.searchParams.get('status') // 'sent', 'failed'
    const type = url.searchParams.get('type') // 'violation', 'warning', etc.

    // Build where clause
    const where: any = { userId: user.id }
    if (channel) where.channel = channel
    if (status) where.status = status
    if (type) where.type = type

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        channel: true,
        status: true,
        sentAt: true,
        createdAt: true,
        metadata: true
      }
    })

    const totalNotifications = await prisma.notification.count({ where })

    // Get summary statistics
    const stats = await prisma.notification.groupBy({
      by: ['channel', 'status'],
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

    const summary: any = {
      total: 0,
      byChannel: {},
      byStatus: {},
      successRate: 0
    }

    let totalSent = 0
    let totalFailed = 0

    stats.forEach(stat => {
      const count = stat._count.id
      summary.total += count

      if (!summary.byChannel[stat.channel]) {
        summary.byChannel[stat.channel] = 0
      }
      summary.byChannel[stat.channel] += count

      if (!summary.byStatus[stat.status]) {
        summary.byStatus[stat.status] = 0
      }
      summary.byStatus[stat.status] += count

      if (stat.status === 'sent') {
        totalSent += count
      } else if (stat.status === 'failed') {
        totalFailed += count
      }
    })

    if (totalSent + totalFailed > 0) {
      summary.successRate = Math.round((totalSent / (totalSent + totalFailed)) * 100)
    }

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        total: totalNotifications,
        limit,
        offset,
        hasMore: offset + limit < totalNotifications
      },
      summary
    })

  } catch (error) {
    console.error('Get notification history error:', error)
    return NextResponse.json(
      { error: 'Failed to get notification history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/notifications/history - Clear notification history
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const olderThan = url.searchParams.get('olderThan') // ISO date string
    const channel = url.searchParams.get('channel')
    const status = url.searchParams.get('status')

    // Build where clause
    const where: any = { userId: user.id }
    if (olderThan) {
      where.createdAt = { lt: new Date(olderThan) }
    }
    if (channel) where.channel = channel
    if (status) where.status = status

    // Delete notifications (but keep last 50 for audit purposes)
    const deleteResult = await prisma.notification.deleteMany({
      where: {
        ...where,
        id: {
          notIn: (await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: { id: true }
          })).map(n => n.id)
        }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Deleted ${deleteResult.count} notification(s)`
    })

  } catch (error) {
    console.error('Delete notification history error:', error)
    return NextResponse.json(
      { error: 'Failed to clear notification history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}