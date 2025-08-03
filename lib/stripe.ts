import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default stripePromise

export const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    priceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    features: [
      'Real-time compliance monitoring',
      'Basic alerts via email',
      'Up to 100 trades per month',
      'TradingView integration',
      'Basic reporting',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 79,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Basic',
      'SMS alerts via Twilio',
      'Unlimited trades',
      'Advanced compliance rules',
      'Custom risk parameters',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Professional',
      'Multiple trading accounts',
      'Team management',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
  },
]