'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PROP_FIRMS, type PropFirm } from '@/lib/config/prop-firms'

export default function TraderOnboarding() {
  const [step, setStep] = useState(1)
  const [selectedFirm, setSelectedFirm] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedFirmData = PROP_FIRMS.find(firm => firm.id === selectedFirm)
  const selectedAccountData = selectedFirmData?.accounts.find(acc => acc.id === selectedAccount)

  const handleContinue = async () => {
    if (step === 1 && selectedFirm) {
      setStep(2)
      return
    }

    if (step === 2 && selectedAccount) {
      setIsLoading(true)
      
      try {
        // Setup account
        const setupResponse = await fetch('/api/setup/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propFirmAccountId: selectedAccount,
            startingBalance: selectedAccountData?.accountSize || 0
          })
        })

        const setupData = await setupResponse.json()
        if (!setupData.success) throw new Error(setupData.error)

        // Create Stripe checkout for Professional plan
        const checkoutResponse = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: 'price_professional_monthly',
            successUrl: `${window.location.origin}/dashboard`,
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
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 self-center rounded ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-700'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            Step {step} of 2 • 30 seconds to trading protection
          </div>
        </div>

        {/* Step 1: Prop Firm Selection */}
        {step === 1 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-2">Select Your Prop Firm</h2>
            <p className="text-gray-400 mb-6">Choose your prop trading firm to load the correct rules</p>
            
            <div className="grid gap-3">
              {PROP_FIRMS.map((firm) => (
                <button
                  key={firm.id}
                  onClick={() => setSelectedFirm(firm.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedFirm === firm.id
                      ? 'border-blue-500 bg-blue-900/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{firm.displayName}</div>
                      <div className="text-sm text-gray-400">
                        {firm.accounts.length} account types available
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {firm.id.toUpperCase()}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!selectedFirm}
                size="lg"
                className="min-w-32"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Account Type */}
        {step === 2 && selectedFirmData && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-2">Select Account Type</h2>
            <p className="text-gray-400 mb-6">
              Choose your {selectedFirmData.displayName} account size
            </p>
            
            <div className="grid gap-3 mb-6">
              {selectedFirmData.accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedAccount === account.id
                      ? 'border-blue-500 bg-blue-900/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{account.name}</div>
                      <div className="text-sm text-gray-400">
                        ${account.accountSize.toLocaleString()} Account
                        {account.monthlyPrice && ` • $${account.monthlyPrice}/mo prop firm fee`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        ${account.accountSize.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Plan summary */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="text-lg font-bold">FundedSafe Pro</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">$24.99</div>
                  <div className="text-xs text-gray-400">/month</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>✓ Real-time compliance monitoring</div>
                <div>✓ TradingView webhook integration</div>
                <div>✓ SMS & email alerts</div>
                <div>✓ Advanced analytics dashboard</div>
              </div>
              
              <div className="mt-3 text-xs text-green-400">
                7-day trial for $1 • Cancel anytime
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                size="lg"
              >
                Back
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedAccount || isLoading}
                size="lg"
                className="min-w-40"
              >
                {isLoading ? 'Setting up...' : 'Start Free Trial'}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <div className="mb-2">
            🔒 Secure payment by Stripe • No setup fees • Cancel anytime
          </div>
          <div className="flex justify-center space-x-6 text-xs">
            <div>⚡ Setup in 30 seconds</div>
            <div>📊 Live trading dashboard</div>
            <div>🔔 Instant violation alerts</div>
          </div>
        </div>
      </div>
    </div>
  )
}