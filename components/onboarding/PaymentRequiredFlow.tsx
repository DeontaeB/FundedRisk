'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PropFirm {
  id: string
  name: string
  displayName: string
  accounts: PropFirmAccount[]
}

interface PropFirmAccount {
  id: string
  name: string
  accountSize: number
  ruleTemplates: RuleTemplate[]
}

interface RuleTemplate {
  ruleType: string
  maxValue?: number
  percentage?: number
}

interface PlanOption {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  stripePriceId: string
}

const PLANS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    description: 'Perfect for individual traders',
    stripePriceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: [
      'Single prop firm tracking',
      'Basic email alerts',
      'Essential compliance monitoring',
      'TradingView webhook integration',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 39,
    description: 'Your co-pilot that protects your account',
    stripePriceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    popular: true,
    features: [
      'Everything in Starter',
      'Multiple prop firm support',
      'Real-time SMS alerts',
      'Advanced analytics dashboard',
      'Priority support',
      'Custom alert thresholds'
    ]
  }
]

export default function PaymentRequiredFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State management
  const [propFirms, setPropFirms] = useState<PropFirm[]>([])
  const [selectedFirm, setSelectedFirm] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('professional') // Default to popular
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    startingBalance: 0
  })

  useEffect(() => {
    checkUserStatus()
    fetchPropFirms()
  }, [])

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user/status')
      const data = await response.json()
      
      if (data.success) {
        // If user has active subscription, redirect to dashboard
        if (data.data.hasActiveSubscription) {
          router.push('/dashboard')
          return
        }
        
        // If user completed setup but no payment, go to payment step
        if (data.data.hasCompletedSetup) {
          setCurrentStep(3)
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPropFirms = async () => {
    try {
      const response = await fetch('/api/setup/prop-firms')
      const data = await response.json()
      if (data.success) {
        setPropFirms(data.data)
      }
    } catch (error) {
      console.error('Error fetching prop firms:', error)
    }
  }

  const handleFirmSelection = (firmId: string) => {
    setSelectedFirm(firmId)
    setSelectedAccount('')
    setCurrentStep(2)
  }

  const handleAccountSelection = (accountId: string) => {
    setSelectedAccount(accountId)
    const account = propFirms
      .find(f => f.id === selectedFirm)
      ?.accounts.find(a => a.id === accountId)
    
    if (account) {
      setAccountDetails(prev => ({
        ...prev,
        startingBalance: account.accountSize
      }))
      setCurrentStep(3) // Go to plan selection
    }
  }

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handlePaymentAndSetup = async () => {
    setSaving(true)
    try {
      // First, save the setup data
      const setupResponse = await fetch('/api/setup/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propFirmAccountId: selectedAccount,
          accountNumber: accountDetails.accountNumber,
          startingBalance: accountDetails.startingBalance,
          selectedPlan: selectedPlan
        })
      })

      const setupData = await setupResponse.json()
      
      if (!setupData.success) {
        throw new Error(setupData.error)
      }

      // Create Stripe checkout session
      const plan = PLANS.find(p => p.id === selectedPlan)
      const checkoutResponse = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan?.stripePriceId,
          successUrl: `${window.location.origin}/onboarding/success`,
          cancelUrl: `${window.location.origin}/onboarding?step=3`
        })
      })

      const checkoutData = await checkoutResponse.json()
      
      if (checkoutData.success) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.data.url
      } else {
        throw new Error(checkoutData.error)
      }

    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment processing failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-secondary-200 rounded w-2/3 mx-auto"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedFirmData = propFirms.find(firm => firm.id === selectedFirm)
  const selectedAccountData = selectedFirmData?.accounts.find(acc => acc.id === selectedAccount)
  const selectedPlanData = PLANS.find(plan => plan.id === selectedPlan)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { step: 1, label: 'Prop Firm' },
          { step: 2, label: 'Account' },
          { step: 3, label: 'Plan & Payment' }
        ].map(({ step, label }) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-200 text-secondary-600'
              }`}>
                {step}
              </div>
              <span className="text-xs mt-1 text-secondary-600">{label}</span>
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 mx-2 mt-[-20px] ${
                currentStep > step ? 'bg-primary-600' : 'bg-secondary-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Prop Firm */}
      {currentStep >= 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-secondary-900">
            {currentStep === 1 ? 'Step 1: ' : '✓ '}Select Your Prop Firm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propFirms.map((firm) => (
              <button
                key={firm.id}
                onClick={() => currentStep === 1 && handleFirmSelection(firm.id)}
                disabled={currentStep !== 1}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedFirm === firm.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : currentStep === 1
                    ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
                    : 'border-secondary-200 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {firm.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900">{firm.displayName}</div>
                    <div className="text-sm text-secondary-600">
                      {firm.accounts.length} account{firm.accounts.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Account Type */}
      {currentStep >= 2 && selectedFirmData && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-secondary-900">
            {currentStep === 2 ? 'Step 2: ' : '✓ '}Select Your {selectedFirmData.displayName} Account
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedFirmData.accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => currentStep === 2 && handleAccountSelection(account.id)}
                disabled={currentStep !== 2}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedAccount === account.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : currentStep === 2
                    ? 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
                    : 'border-secondary-200 opacity-60'
                }`}
              >
                <h4 className="font-semibold text-secondary-900 mb-1">{account.name}</h4>
                <p className="text-sm text-secondary-600">${account.accountSize.toLocaleString()} Account</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Plan Selection & Payment */}
      {currentStep >= 3 && selectedAccountData && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-secondary-900">Step 3: Choose Your Plan</h3>
          
          {/* Selected Account Summary */}
          <div className="card-premium bg-gradient-to-br from-primary-50 to-accent-50">
            <h4 className="font-semibold text-secondary-900 mb-2">Selected Account</h4>
            <p className="text-secondary-700">
              {selectedFirmData?.displayName} - {selectedAccountData.name} (${selectedAccountData.accountSize.toLocaleString()})
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  plan.popular
                    ? 'card-premium shadow-premium border-2 border-primary-200 scale-105'
                    : 'card-premium hover:shadow-premium'
                } ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-primary-500 ring-opacity-50'
                    : ''
                }`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center py-2 text-sm font-bold">
                    🏆 MOST POPULAR
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">{plan.name}</h3>
                    <p className="text-secondary-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-secondary-900">
                        ${plan.price}
                      </span>
                      <span className="text-secondary-600 ml-2">
                        /month
                      </span>
                    </div>
                    <div className="text-primary-600 font-medium">
                      Only ${(plan.price / 30).toFixed(2)}/day
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-secondary-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                    selectedPlan === plan.id
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-secondary-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Account Details */}
          <div className="card space-y-4">
            <h4 className="font-semibold text-secondary-900">Account Details (Optional)</h4>
            <Input
              label="Account Number"
              value={accountDetails.accountNumber}
              onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Enter your prop firm account number"
            />
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-6 mb-6">
              <div className="text-center">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Ready to protect your {selectedAccountData.name} account?
                </h4>
                <p className="text-secondary-600 text-sm mb-4">
                  Start your 7-day trial for $1, then ${selectedPlanData?.price}/month. Cancel anytime.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-secondary-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    7-day $1 trial
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cancel anytime
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure payment
                  </div>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handlePaymentAndSetup}
              disabled={saving}
              className="px-12 py-4 text-lg"
            >
              {saving ? 'Processing...' : `Start $1 Trial - ${selectedPlanData?.name} Plan`}
            </Button>
            
            <p className="text-xs text-secondary-500 mt-4 max-w-md mx-auto">
              By continuing, you agree to our Terms of Service and Privacy Policy. 
              Your webhook URL will be generated after successful payment.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}