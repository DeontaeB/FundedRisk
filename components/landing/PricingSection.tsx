'use client'

import Link from 'next/link'

export default function PricingSection() {
  const plan = {
    name: 'FundedSafe Pro',
    description: 'Complete protection for your prop firm account',
    price: 24.99,
    features: [
      'Real-time compliance monitoring',
      'TradingView webhook integration',
      'Email & SMS alerts',
      'Advanced analytics dashboard',
      'Unlimited trades tracking',
      'Multiple prop firm accounts',
      'Custom risk rules',
      'Priority support',
      'API access'
    ],
    dailyCost: '$0.83'
  }

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-6">
            <span className="gradient-text">Protect Your Account</span> for Less Than a Coffee
          </h2>
          <p className="text-large max-w-3xl mx-auto mb-8">
            Why risk losing $150+ on prop firm resets when you can protect your account for just ${plan.dailyCost}/day? 
            Join thousands of traders who never worry about compliance violations.
          </p>
        </div>

        {/* Single Plan Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 card-premium shadow-premium border-2 border-primary-200">
            {/* Popular Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center py-3 text-sm font-bold">
              🏆 UNIVERSAL PLAN - EVERYTHING INCLUDED
            </div>

            <div className="p-8 pt-16">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-secondary-900 mb-3">{plan.name}</h3>
                <p className="text-secondary-600 mb-6 text-lg font-medium">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-6xl font-bold text-secondary-900">
                    ${plan.price}
                  </span>
                  <span className="text-secondary-600 ml-2 text-xl">
                    /month
                  </span>
                </div>

                {/* Daily Cost */}
                <div className="text-primary-600 font-medium mb-4">
                  Only {plan.dailyCost}/day
                </div>

                {/* Savings Highlight */}
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-success-100 text-success-700 border border-success-200">
                  💰 Pays for itself with just 1 prevented reset
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-secondary-900 mb-4 text-center">Everything you need:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-secondary-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link 
                  href="/auth/signin" 
                  className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Protecting Your Account
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-sm text-secondary-600 mt-3">
                  7-day trial for $1 • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Props */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Account Protection</h3>
            <p className="text-secondary-600">Real-time monitoring prevents costly violations before they happen</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Instant Alerts</h3>
            <p className="text-secondary-600">Get notified immediately via SMS and email when risks are detected</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Advanced Analytics</h3>
            <p className="text-secondary-600">Track performance and optimize your trading with detailed insights</p>
          </div>
        </div>

        {/* $1 Trial Offer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">Try for Just $1</h3>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Start your 7-day trial for only $1, then continue for $24.99/month. Experience the full power of FundedSafe and see how it protects your account from day one.
          </p>
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-success-50 to-primary-50 border border-success-200 rounded-full">
            <span className="text-success-700 font-semibold text-lg">🎯 7 days for $1 • Then $24.99/month • Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}