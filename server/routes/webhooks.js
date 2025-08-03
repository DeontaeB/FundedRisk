const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { verifyTradingViewWebhook } = require('../middleware/webhook')

const router = express.Router()
const prisma = new PrismaClient()

// TradingView webhook endpoint
router.post('/tradingview', verifyTradingViewWebhook, async (req, res) => {
  try {
    const {
      symbol,
      side,
      quantity,
      price,
      orderType,
      userId,
      timestamp
    } = req.body

    // Create trade from TradingView signal
    const trade = await prisma.trade.create({
      data: {
        userId,
        symbol,
        side,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        orderType,
        tradingViewId: `tv_${timestamp}`,
        status: 'open',
        source: 'tradingview'
      }
    })

    // Check compliance rules
    const complianceService = require('../services/compliance')
    await complianceService.checkTradeCompliance(userId, trade)

    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`user-${userId}`).emit('trade-created', trade)
    }

    res.status(200).json({ success: true, tradeId: trade.id })
  } catch (error) {
    console.error('TradingView webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        await handleSuccessfulPayment(paymentIntent)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object
        await handleSubscriptionUpdated(updatedSubscription)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    res.status(400).send(`Webhook error: ${error.message}`)
  }
})

async function handleSuccessfulPayment(paymentIntent) {
  // Update user's payment status
  await prisma.user.update({
    where: { stripeCustomerId: paymentIntent.customer },
    data: { paymentStatus: 'paid' }
  })
}

async function handleSubscriptionCreated(subscription) {
  // Create subscription record
  await prisma.subscription.create({
    data: {
      stripeSubscriptionId: subscription.id,
      userId: subscription.metadata.userId,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

async function handleSubscriptionUpdated(subscription) {
  // Update subscription record
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

module.exports = router