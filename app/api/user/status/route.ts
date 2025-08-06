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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        isSetupComplete: true,
        paymentStatus: true,
        webhookUrl: true,
        subscriptions: {
          where: {
            status: { in: ['active', 'trialing', 'past_due'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            status: true,
            priceId: true,
            currentPeriodEnd: true
          }
        },
        userAccounts: {
          where: { isActive: true },
          select: {
            id: true,
            propFirmAccount: {
              select: {
                name: true,
                accountSize: true,
                propFirm: {
                  select: {
                    displayName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasActiveSubscription = user.subscriptions.length > 0 && 
      ['active', 'trialing'].includes(user.subscriptions[0].status)

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        hasCompletedSetup: user.isSetupComplete,
        hasActiveSubscription,
        paymentStatus: user.paymentStatus,
        subscription: user.subscriptions[0] || null,
        accounts: user.userAccounts,
        webhookUrl: user.webhookUrl ? 
          `${process.env.NEXTAUTH_URL}/api${user.webhookUrl}` : null
      }
    })

  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}