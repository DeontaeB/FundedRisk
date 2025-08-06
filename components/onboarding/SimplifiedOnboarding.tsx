'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PROP_FIRMS, type PropFirm } from '@/lib/config/prop-firms'


const PLANS = [
  {
    id: 'professional',
    name: 'Professional',
    price: 39,
    description: 'Your co-pilot that protects your account',
    stripePriceId: 'price_professional_monthly',
    popular: true,
    features: [
      'Multiple prop firm support',
      'Real-time SMS & email alerts',
      'Advanced analytics dashboard',
      'TradingView webhook integration',
      'Priority support'
    ]
  }
]

export default function SimplifiedOnboarding() {
  const [saving, setSaving] = useState(false)  
  const [propFirms, setPropFirms] = useState<PropFirm[]>([])
  const [selectedFirm, setSelectedFirm] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('professional')
  const [accountNumber, setAccountNumber] = useState<string>('')

  useEffect(() => {
    // Load prop firms from modular configuration
    setPropFirms(PROP_FIRMS)
  }, [])


  const handleStartTrial = async () => {
    setSaving(true)
    try {
      // Save setup data
      const setupResponse = await fetch('/api/setup/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propFirmAccountId: selectedAccount,
          accountNumber: accountNumber,
          startingBalance: selectedAccountData?.accountSize || 0,
          selectedPlan: selectedPlan
        })
      })

      const setupData = await setupResponse.json()
      if (!setupData.success) throw new Error(setupData.error)

      // Create Stripe checkout
      const plan = PLANS.find(p => p.id === selectedPlan)
      const checkoutResponse = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan?.stripePriceId,
          successUrl: `${window.location.origin}/onboarding/success`,
          cancelUrl: `${window.location.origin}/onboarding`
        })
      })

      const checkoutData = await checkoutResponse.json()
      if (checkoutData.success) {
        window.location.href = checkoutData.data.url
      }
    } catch (error) {
      alert('Setup failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }


  const selectedFirmData = propFirms.find(firm => firm.id === selectedFirm)
  const selectedAccountData = selectedFirmData?.accounts.find(acc => acc.id === selectedAccount)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Main Header */}
      <div className="text-center">
        <h1 className="heading-lg mb-4">Set Up Your Trading Protection</h1>
        <p className="text-large text-secondary-600 max-w-2xl mx-auto">
          Tell us your prop firm rules so we can automatically monitor your TradingView alerts for compliance violations.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Prop Firm */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">1. What&apos;s your prop firm?</h3>
            <select
              value={selectedFirm}
              onChange={(e) => {
                setSelectedFirm(e.target.value)
                setSelectedAccount('')
              }}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-secondary-900"
            >
              <option value="">Select your prop firm...</option>
              {propFirms.map((firm) => (
                <option key={firm.id} value={firm.id}>
                  {firm.displayName} ({firm.accounts.length} account types)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Account Type */}
          {selectedFirmData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                2. What&apos;s your {selectedFirmData.displayName} account type?
              </h3>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-secondary-900"
              >
                <option value="">Select your account type...</option>
                {selectedFirmData.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${account.accountSize.toLocaleString()} Account
                    {account.monthlyPrice ? ` ($${account.monthlyPrice}/mo)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Account Number (Optional) */}
          {selectedAccount && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">3. Account details (optional)</h3>
              <Input
                label="Your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. MFX12345 (helps identify your account)"
              />
            </div>
          )}
        </div>

        {/* Right Column - Plan Selection */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Plan</h3>
            <div className="p-4 rounded-lg border-2 border-primary-500 bg-primary-50 ring-2 ring-primary-200">
              <div className="bg-primary-600 text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                FUNDEDSAFE PRO
              </div>
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-secondary-900">FundedSafe Pro</div>
                <div className="text-right">
                  <div className="text-lg font-bold text-secondary-900">$24.99</div>
                  <div className="text-xs text-secondary-600">/month</div>
                </div>
              </div>
              <div className="text-sm text-secondary-600 mb-3">Complete protection for your prop firm account</div>
              <ul className="text-xs space-y-1">
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Multiple prop firm support
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Real-time SMS & email alerts
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  TradingView webhook integration
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          {/* Summary & CTA */}
          <div className="card bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
            <h4 className="font-semibold text-secondary-900 mb-3">Ready to start?</h4>
            
            {selectedAccount ? (
              <div className="text-sm text-secondary-700 space-y-1 mb-4">
                <div>• {selectedFirmData?.displayName} {selectedAccountData?.name}</div>
                <div>• FundedSafe Pro ($24.99/month)</div>
                <div>• 7-day trial for $1</div>
                <div>• Webhook URL generated after payment</div>
              </div>
            ) : (
              <div className="text-sm text-secondary-600 mb-4">
                Select your prop firm and account type above to continue
              </div>
            )}
            
            <Button 
              onClick={handleStartTrial}
              disabled={!selectedAccount || saving}
              className="w-full"
              size="lg"
            >
              {saving ? 'Setting up...' : selectedAccount ? `Start $1 Trial` : 'Complete Setup First'}
            </Button>
            
            <p className="text-xs text-secondary-500 mt-3 text-center">
              No setup fees • Cancel anytime • Secure payment by Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Explanation */}
      <div className="card bg-secondary-50">
        <h4 className="font-semibold text-secondary-900 mb-3">📖 How it works</h4>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
            <p className="text-secondary-700">We load your prop firm&apos;s rules into our system</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
            <p className="text-secondary-700">You get a personal webhook URL</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
            <p className="text-secondary-700">Add it to your TradingView alerts</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-success-500 rounded-full text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold">✓</div>
            <p className="text-secondary-700">We automatically check every trade</p>
          </div>
        </div>
      </div>
    </div>
  )
}