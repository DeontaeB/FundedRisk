import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { retrieveSubscription, getPlanByPriceId, formatPrice } from '@/lib/stripe-server'

const prisma = new PrismaClient()

// GET /api/stripe/subscription - Get user's subscription details
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Get user's subscription from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        stripeCustomerId: true,
        paymentStatus: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing', 'past_due'] }
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

    // Return no subscription if user doesn't have one
    if (dbUser.subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        paymentStatus: dbUser.paymentStatus,
        subscription: null,
        plan: null
      })
    }

    const subscription = dbUser.subscriptions[0]

    try {
      // Get latest subscription data from Stripe
      const stripeSubscription = await retrieveSubscription(subscription.stripeSubscriptionId)
      
      // Get plan details
      const priceId = stripeSubscription.items.data[0].price.id
      const plan = getPlanByPriceId(priceId)

      // Update local subscription if status changed
      if (subscription.status !== stripeSubscription.status) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
          }
        })

        // Update user payment status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            paymentStatus: stripeSubscription.status === 'active' ? 'active' : 
                          stripeSubscription.status === 'trialing' ? 'active' : 'inactive'
          }
        })
      }

      return NextResponse.json({
        success: true,
        hasSubscription: true,
        paymentStatus: stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing' ? 'active' : 'inactive',
        subscription: {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          priceId,
          amount: stripeSubscription.items.data[0].price.unit_amount,
          currency: stripeSubscription.items.data[0].price.currency,
          interval: stripeSubscription.items.data[0].price.recurring?.interval,
        },
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          price: formatPrice(plan.price),
          features: plan.features,
          tradeLimit: plan.tradeLimit,
          smsAlerts: plan.smsAlerts || false,
          prioritySupport: plan.prioritySupport || false
        } : null
      })

    } catch (stripeError) {
      console.error('Error fetching subscription from Stripe:', stripeError)
      
      // Return database data if Stripe is unavailable
      const plan = getPlanByPriceId(subscription.priceId)
      
      return NextResponse.json({
        success: true,
        hasSubscription: true,
        paymentStatus: dbUser.paymentStatus,
        subscription: {
          id: subscription.stripeSubscriptionId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          priceId: subscription.priceId,
        },
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          price: formatPrice(plan.price),
          features: plan.features,
          tradeLimit: plan.tradeLimit,
          smsAlerts: plan.smsAlerts || false,
          prioritySupport: plan.prioritySupport || false
        } : null,
        warning: 'Subscription data may not be up to date'
      })
    }

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}