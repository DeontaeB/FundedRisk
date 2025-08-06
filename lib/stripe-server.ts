import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Universal pricing plan - single $24.99 plan with $1 trial
export const PRICING_PLAN = {
  id: 'universal',
  name: 'FundedSafe Pro',
  priceId: 'price_1234567890_universal', // Replace with actual Stripe price ID
  price: 2499, // $24.99 in cents
  currency: 'usd',
  interval: 'month',
  trial: {
    price: 100, // $1.00 in cents for trial
    days: 7, // 7-day trial period
    description: 'Try for 7 days for $1, then $24.99/month'
  },
  features: [
    'Real-time compliance monitoring',
    'TradingView webhook integration', 
    'Email & SMS alerts',
    'Advanced analytics dashboard',
    'Unlimited trades',
    'Multiple prop firm accounts',
    'Custom risk rules',
    'Priority support',
    'API access'
  ],
  tradeLimit: -1, // Unlimited
  smsAlerts: true,
  prioritySupport: true,
  multipleAccounts: true,
  teamManagement: true,
  apiAccess: true,
  popular: true
} as const

// Legacy structure for backwards compatibility during transition
export const PRICING_PLANS = {
  universal: PRICING_PLAN
} as const

export type PlanId = keyof typeof PRICING_PLANS

// Helper functions
export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        created_by: 'propruletracke'
      }
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
  withTrial = true
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  withTrial?: boolean
}) {
  try {
    const sessionConfig: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata,
      },
    }

    // Add trial configuration if enabled
    if (withTrial && PRICING_PLAN.trial) {
      // For $1 trial, we'll charge $1 immediately and then the full price after trial
      sessionConfig.payment_intent_data = {
        setup_future_usage: 'off_session'
      }
      
      // Create a one-time payment for $1 trial
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [
        {
          price_data: {
            currency: PRICING_PLAN.currency,
            product_data: {
              name: `${PRICING_PLAN.name} - 7-Day Trial`,
              description: PRICING_PLAN.trial.description,
            },
            unit_amount: PRICING_PLAN.trial.price, // $1.00
          },
          quantity: 1,
        },
      ]
      
      // Add metadata to track this as a trial purchase
      sessionConfig.metadata = {
        ...metadata,
        trial_purchase: 'true',
        trial_days: PRICING_PLAN.trial.days.toString(),
        regular_price_id: priceId
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw error
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export function getPlanByPriceId(priceId: string): (typeof PRICING_PLANS)[PlanId] | null {
  for (const plan of Object.values(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return plan
    }
  }
  return null
}

export function formatPrice(price: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100)
}

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required')
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw error
  }
}