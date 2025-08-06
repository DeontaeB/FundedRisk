import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyWebhookSignature, getPlanByPriceId } from '@/lib/stripe-server'
import { nanoid } from 'nanoid'
import Stripe from 'stripe'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = verifyWebhookSignature(body, signature)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId

  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  // Update user with Stripe customer ID and payment status
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      paymentStatus: 'active'
    }
  })

  // Generate webhook URL token if not exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { webhookUrl: true }
  })

  if (!user?.webhookUrl) {
    const webhookToken = nanoid(32)
    await prisma.user.update({
      where: { id: userId },
      data: {
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/secure/${webhookToken}`,
        isSetupComplete: true
      }
    })
  }

  console.log(`✅ Checkout completed for user ${userId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })

  console.log(`✅ Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })

  // Update user payment status based on subscription status
  const userSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  })

  if (userSubscription) {
    await prisma.user.update({
      where: { id: userSubscription.userId },
      data: {
        paymentStatus: subscription.status === 'active' ? 'active' : 'inactive'
      }
    })
  }

  console.log(`✅ Subscription updated: ${subscription.id} - ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' }
  })

  // Update user payment status
  const userSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  })

  if (userSubscription) {
    await prisma.user.update({
      where: { id: userSubscription.userId },
      data: { paymentStatus: 'inactive' }
    })
  }

  console.log(`✅ Subscription canceled: ${subscription.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    // Update subscription status
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'active' }
    })

    // Update user payment status
    const userSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string }
    })

    if (userSubscription) {
      await prisma.user.update({
        where: { id: userSubscription.userId },
        data: { paymentStatus: 'active' }
      })
    }
  }

  console.log(`✅ Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    // Update user payment status
    const userSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string }
    })

    if (userSubscription) {
      await prisma.user.update({
        where: { id: userSubscription.userId },
        data: { paymentStatus: 'past_due' }
      })

      // Send notification about failed payment
      // TODO: Implement notification system
      console.log(`⚠️ Payment failed for user ${userSubscription.userId}`)
    }
  }
}