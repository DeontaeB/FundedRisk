import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with webhook info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userAccounts: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get webhook events count and recent activity
    const totalAlerts = await prisma.webhookEvent.count({
      where: { userId: session.user.id }
    })

    const recentAlerts = await prisma.webhookEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        symbol: true,
        action: true,
        status: true,
        createdAt: true,
        isComplianceViolation: true
      }
    })

    const lastAlert = await prisma.webhookEvent.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fullWebhookUrl = user.webhookUrl ? `${baseUrl}/api${user.webhookUrl}` : null

    return NextResponse.json({
      success: true,
      data: {
        webhookUrl: fullWebhookUrl,
        isActive: !!user.webhookUrl && user.isSetupComplete,
        lastPing: lastAlert?.createdAt,
        totalAlerts,
        recentAlerts: recentAlerts.map(alert => ({
          ...alert,
          isViolation: alert.isComplianceViolation
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching webhook status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}