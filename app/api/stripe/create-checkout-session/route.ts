import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { createStripeCustomer, createCheckoutSession, PRICING_PLAN } from '@/lib/stripe-server'
import { z } from 'zod'

const prisma = new PrismaClient()

const createCheckoutSchema = z.object({
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { successUrl, cancelUrl } = createCheckoutSchema.parse(body)

    // Get the user from database to check current status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          orderBy: { createdAt: 'desc' },
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

    // Check if user already has an active subscription
    if (dbUser.subscriptions.length > 0) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Use the universal plan
    const plan = PRICING_PLAN

    // Create or get Stripe customer
    let customerId = dbUser.stripeCustomerId
    
    if (!customerId) {
      const customer = await createStripeCustomer(
        dbUser.email,
        `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim()
      )
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const session = await createCheckoutSession({
      customerId,
      priceId: plan.priceId,
      successUrl: successUrl || `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/pricing`,
      metadata: {
        userId: user.id,
        planId: plan.id,
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: plan.features
      }
    })

  } catch (error) {
    console.error('Create checkout session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { error: 'Payment service error. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}