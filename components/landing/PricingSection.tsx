'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individual traders',
      monthlyPrice: 19,
      annualPrice: 16,
      features: [
        'Single prop firm tracking',
        'Basic email alerts',
        'Essential compliance monitoring',
        'TradingView webhook integration',
        'Basic performance tracking',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'secondary',
      savings: 'Save $131+ vs failed evaluation',
      dailyCost: '$0.53'
    },
    {
      name: 'Professional',
      description: 'Your co-pilot that protects your account',
      monthlyPrice: 39,
      annualPrice: 32,
      features: [
        'Everything in Starter',
        'Multiple prop firm support',
        'Real-time SMS alerts',
        'Advanced analytics dashboard',
        'Priority support',
        'Custom alert thresholds',
        'Advanced violation prevention',
        'Account reset protection'
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: 'primary',
      savings: 'Pays for itself with just 1 prevented reset',
      dailyCost: '$1.07'
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice
  }

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12
    const annualCost = plan.annualPrice * 12
    return Math.round(((monthlyCost - annualCost) / monthlyCost) * 100)
  }

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-6">
            <span className="gradient-text">Protect Your Account</span> for Less Than a Coffee
          </h2>
          <p className="text-large max-w-3xl mx-auto mb-8">
            Why risk losing $150+ on prop firm resets when you can protect your account for just $1.07/day? 
            Join thousands of individual traders who never worry about compliance violations.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-secondary-100 rounded-full p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                !isAnnual
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 relative ${
                isAnnual
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-success-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>


        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? 'card-premium shadow-premium border-2 border-primary-200 scale-105'
                  : 'card-premium hover:shadow-premium'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center py-3 text-sm font-bold">
                  🏆 MOST POPULAR - SAVES $150+ PER RESET
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-3">{plan.name}</h3>
                  <p className={`text-secondary-600 mb-6 ${plan.popular ? 'text-lg font-medium' : ''}`}>{plan.description}</p>
                  
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-secondary-900">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-secondary-600 ml-2 text-xl">
                      /month
                    </span>
                  </div>

                  {/* Daily Cost */}
                  <div className="text-primary-600 font-medium mb-4">
                    Only {isAnnual ? plan.dailyCost : `$${(plan.monthlyPrice / 30).toFixed(2)}`}/day
                  </div>

                  {/* Savings Highlight */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                    plan.popular 
                      ? 'bg-success-100 text-success-700 border border-success-200' 
                      : 'bg-primary-100 text-primary-700 border border-primary-200'
                  }`}>
                    💰 {plan.savings}
                  </div>

                  {isAnnual && (
                    <div className="inline-flex items-center px-3 py-1 bg-warning-100 rounded-full text-warning-700 text-sm font-medium">
                      Save {getSavings(plan)}% annually
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href="/onboarding">
                  <button 
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    Start Free Trial - Connect Prop Firm
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* The Cost of Rule Violations - Improved Section */}
        <div className="bg-gradient-to-br from-error-900 to-error-800 rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-error-600/20 to-warning-600/20 backdrop-blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-warning-400/30 to-error-400/30 rounded-full blur-3xl"></div>
          
          <div className="relative text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="text-warning-200 mr-2">⚠️</span>
              <span className="text-sm font-medium">The Hidden Cost of Trading Violations</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              One Mistake Costs More Than Our <span className="text-warning-300">Entire Year</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-error-200 mb-3">$150+</div>
                <div className="text-error-100 font-medium mb-2">Reset Fee</div>
                <div className="text-sm text-white/70">Average prop firm penalty</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-warning-200 mb-3">30+</div>
                <div className="text-warning-100 font-medium mb-2">Days Lost</div>
                <div className="text-sm text-white/70">Restarting evaluation process</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-error-200 mb-3">$5,000+</div>
                <div className="text-error-100 font-medium mb-2">Opportunity Cost</div>
                <div className="text-sm text-white/70">Lost trading profits</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-success-500/20 to-primary-500/20 backdrop-blur-sm rounded-2xl p-6 border border-success-400/30">
              <div className="flex items-center justify-center mb-4">
                <div className="w-3 h-3 bg-success-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-success-200 font-semibold">Smart Protection</span>
              </div>
              <p className="text-lg font-medium text-white">
                FundedSafe costs <span className="text-success-300 font-bold">$39/month</span> - less than a third the cost of a single violation
              </p>
              <p className="text-white/80 text-sm mt-2">
                Individual traders save an average of $500+ in their first month alone
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-secondary-50 rounded-2xl p-8 mb-16">
          <h3 className="text-xl font-bold text-center text-secondary-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-secondary-900 mb-2">
                What happens during the free trial?
              </h4>
              <p className="text-secondary-600 text-sm">
                You get full access to all features for 14 days. No credit card required. 
                Connect your trading accounts and experience real-time compliance monitoring.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-secondary-600 text-sm">
                Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately 
                and we'll prorate the billing accordingly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-900 mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-secondary-600 text-sm">
                We offer a 14-day money-back guarantee. If you're not satisfied, 
                we'll refund your payment in full, no questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-900 mb-2">
                Is my trading data secure?
              </h4>
              <p className="text-secondary-600 text-sm">
                Absolutely. We use bank-grade encryption and are SOC 2 certified. 
                Your trading data is never shared and is stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-8 p-6 bg-gradient-to-r from-success-50 to-primary-50 rounded-2xl border border-success-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-secondary-900">14-Day Money-Back Guarantee</div>
                <div className="text-sm text-secondary-600">Risk-free trial with full refund</div>
              </div>
            </div>
            <div className="w-px h-12 bg-secondary-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-secondary-900">24/7 Priority Support</div>
                <div className="text-sm text-secondary-600">Expert help when you need it</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}