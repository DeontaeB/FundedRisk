'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PropFirm {
  id: string
  name: string
  displayName: string
  website?: string
  accounts: PropFirmAccount[]
}

interface PropFirmAccount {
  id: string
  name: string
  accountSize: number
  propFirmId: string
  ruleTemplates: RuleTemplate[]
}

interface RuleTemplate {
  id: string
  ruleType: string
  maxValue?: number
  percentage?: number
  timeStart?: string
  timeEnd?: string
}

interface SetupData {
  propFirmAccountId: string
  accountNumber?: string
  startingBalance: number
}

export default function EnhancedPropFirmSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [propFirms, setPropFirms] = useState<PropFirm[]>([])
  const [selectedFirm, setSelectedFirm] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [setupData, setSetupData] = useState<SetupData>({
    propFirmAccountId: '',
    accountNumber: '',
    startingBalance: 0
  })
  const [webhookUrl, setWebhookUrl] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    fetchPropFirms()
    checkExistingSetup()
  }, [])

  const fetchPropFirms = async () => {
    try {
      const response = await fetch('/api/setup/prop-firms')
      const data = await response.json()
      
      if (data.success) {
        setPropFirms(data.data)
      }
    } catch (error) {
      console.error('Error fetching prop firms:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkExistingSetup = async () => {
    try {
      const response = await fetch('/api/setup/account')
      const data = await response.json()
      
      if (data.success && data.data.user.isSetupComplete) {
        // User already has setup, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking setup:', error)
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
      setSetupData(prev => ({
        ...prev,
        propFirmAccountId: accountId,
        startingBalance: account.accountSize
      }))
      setCurrentStep(3)
    }
  }

  const handleSetupComplete = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/setup/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setupData)
      })

      const data = await response.json()
      
      if (data.success) {
        setWebhookUrl(data.data.webhookUrl)
        setCurrentStep(4)
        
        // Show success message and redirect after delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 5000)
      } else {
        alert('Error setting up account: ' + data.error)
      }
    } catch (error) {
      console.error('Error completing setup:', error)
      alert('Error completing setup. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    // Show toast notification here
    alert('Webhook URL copied to clipboard!')
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-200 text-secondary-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 mx-2 ${
                currentStep > step ? 'bg-primary-600' : 'bg-secondary-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Connect Your Prop Firm Account</h2>
        <p className="text-large text-secondary-600 max-w-2xl mx-auto">
          Set up automated compliance monitoring for your prop firm account with TradingView integration.
        </p>
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
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {firm.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900">{firm.displayName}</div>
                    <div className="text-sm text-secondary-600">
                      {firm.accounts.length} account{firm.accounts.length > 1 ? 's' : ''} available
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
            {selectedFirmData.accounts.map((account) => {
              const dailyLossRule = account.ruleTemplates.find(r => r.ruleType === 'daily_loss')
              const drawdownRule = account.ruleTemplates.find(r => r.ruleType === 'max_drawdown')
              
              return (
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
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-1">{account.name}</h4>
                      <p className="text-sm text-secondary-600">${account.accountSize.toLocaleString()} Account</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Max Daily Loss:</span>
                      <span className="font-medium text-secondary-900">
                        ${dailyLossRule?.maxValue?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Max Drawdown:</span>
                      <span className="font-medium text-secondary-900">
                        {drawdownRule?.percentage || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: Account Details */}
      {currentStep >= 3 && selectedAccountData && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-secondary-900">
            {currentStep === 3 ? 'Step 3: ' : '✓ '}Account Details
          </h3>
          
          <div className="card-premium space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account Number (Optional)"
                value={setupData.accountNumber || ''}
                onChange={(e) => setSetupData(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter your prop firm account number"
                disabled={currentStep !== 3}
              />
              <Input
                label="Starting Balance"
                type="number"
                value={setupData.startingBalance}
                onChange={(e) => setSetupData(prev => ({ ...prev, startingBalance: parseFloat(e.target.value) }))}
                disabled={currentStep !== 3}
              />
            </div>

            {currentStep === 3 && (
              <div className="flex justify-end">
                <Button onClick={handleSetupComplete} disabled={saving}>
                  {saving ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Webhook URL & Success */}
      {currentStep >= 4 && webhookUrl && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-secondary-900">
            ✅ Setup Complete - Your Webhook URL
          </h3>
          
          <div className="card-premium bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                ✓
              </div>
              <h4 className="text-xl font-semibold text-secondary-900 mb-2">Account Successfully Connected!</h4>
              <p className="text-secondary-600">
                Your {selectedFirmData?.displayName} {selectedAccountData?.name} account is now being monitored.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-secondary-700">TradingView Webhook URL:</label>
                <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                  Copy URL
                </Button>
              </div>
              <code className="text-sm font-mono text-secondary-700 break-all bg-secondary-50 p-2 rounded block">
                {webhookUrl}
              </code>
            </div>

            <div className="space-y-3 text-sm">
              <h5 className="font-semibold text-secondary-900">Next Steps:</h5>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-primary-600">1</span>
                  </div>
                  <span className="text-secondary-600">Copy the webhook URL above</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-primary-600">2</span>
                  </div>
                  <span className="text-secondary-600">Add it to your TradingView strategy alerts</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-primary-600">3</span>
                  </div>
                  <span className="text-secondary-600">Start trading with automatic compliance monitoring!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="px-8"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}