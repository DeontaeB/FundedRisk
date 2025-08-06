import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { createBillingPortalSession } from '@/lib/stripe-server'
import { z } from 'zod'

const prisma = new PrismaClient()

const createPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { returnUrl } = createPortalSchema.parse(body)

    // Get user's Stripe customer ID and subscription info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        stripeCustomerId: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing', 'past_due'] }
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

    if (!dbUser.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      )
    }

    if (dbUser.subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const finalReturnUrl = returnUrl || `${baseUrl}/settings/billing`

    const portalSession = await createBillingPortalSession(
      dbUser.stripeCustomerId,
      finalReturnUrl
    )

    return NextResponse.json({
      success: true,
      url: portalSession.url,
      returnUrl: finalReturnUrl
    })

  } catch (error) {
    console.error('Create portal session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { error: 'Billing service error. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}