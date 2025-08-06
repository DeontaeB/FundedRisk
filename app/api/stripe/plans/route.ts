import { NextResponse } from 'next/server'
import { PRICING_PLAN, formatPrice } from '@/lib/stripe-server'

// GET /api/stripe/plans - Get the universal pricing plan
export async function GET() {
  try {
    const plan = {
      id: PRICING_PLAN.id,
      name: PRICING_PLAN.name,
      price: formatPrice(PRICING_PLAN.price, PRICING_PLAN.currency),
      priceValue: PRICING_PLAN.price,
      currency: PRICING_PLAN.currency,
      interval: PRICING_PLAN.interval,
      features: PRICING_PLAN.features,
      popular: PRICING_PLAN.popular,
      tradeLimit: PRICING_PLAN.tradeLimit,
      smsAlerts: PRICING_PLAN.smsAlerts,
      prioritySupport: PRICING_PLAN.prioritySupport,
      multipleAccounts: PRICING_PLAN.multipleAccounts,
      teamManagement: PRICING_PLAN.teamManagement,
      apiAccess: PRICING_PLAN.apiAccess,
      trial: PRICING_PLAN.trial ? {
        price: formatPrice(PRICING_PLAN.trial.price, PRICING_PLAN.currency),
        priceValue: PRICING_PLAN.trial.price,
        days: PRICING_PLAN.trial.days,
        description: PRICING_PLAN.trial.description
      } : null
    }

    return NextResponse.json({
      success: true,
      plan, // Single plan instead of array
      plans: [plan], // Legacy support for existing frontend code
      currency: 'USD',
      interval: 'month'
    })

  } catch (error) {
    console.error('Get pricing plan error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plan' },
      { status: 500 }
    )
  }
}