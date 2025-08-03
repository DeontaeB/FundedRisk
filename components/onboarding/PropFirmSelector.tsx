'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface PropFirm {
  id: string
  name: string
  logo: string
  accounts: {
    id: string
    name: string
    description: string
    maxLoss: string
    profitTarget: string
    maxContracts: string
    available: boolean
  }[]
}

export default function PropFirmSelector() {
  const [selectedFirm, setSelectedFirm] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')

  const propFirms: PropFirm[] = [
    {
      id: 'myfundedfx',
      name: 'MyFundedFX',
      logo: 'MFX',
      accounts: [
        {
          id: 'scale',
          name: 'Scale',
          description: 'Perfect for beginners',
          maxLoss: '$3,000',
          profitTarget: '$6,000',
          maxContracts: '10',
          available: true
        },
        {
          id: 'core',
          name: 'Core',
          description: 'Most popular choice',
          maxLoss: '$5,000',
          profitTarget: '$10,000',
          maxContracts: '15',
          available: true
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'For experienced traders',
          maxLoss: '$10,000',
          profitTarget: '$20,000',
          maxContracts: '25',
          available: true
        },
        {
          id: 'eval-to-live',
          name: 'Eval To Live',
          description: 'Direct path to funded account',
          maxLoss: '$15,000',
          profitTarget: '$30,000',
          maxContracts: '35',
          available: true
        }
      ]
    },
    {
      id: 'topstep',
      name: 'TopStep',
      logo: 'TS',
      accounts: [
        {
          id: 'combine-50k',
          name: 'Trading Combine $50K',
          description: 'Entry level evaluation',
          maxLoss: '$2,000',
          profitTarget: '$3,000',
          maxContracts: '5',
          available: true
        },
        {
          id: 'combine-100k',
          name: 'Trading Combine $100K',
          description: 'Standard evaluation',
          maxLoss: '$3,000',
          profitTarget: '$6,000',
          maxContracts: '10',
          available: true
        },
        {
          id: 'combine-150k',
          name: 'Trading Combine $150K',
          description: 'Advanced evaluation',
          maxLoss: '$4,500',
          profitTarget: '$9,000',
          maxContracts: '15',
          available: true
        }
      ]
    },
    {
      id: 'earn2trade',
      name: 'Earn2Trade',
      logo: 'E2T',
      accounts: [
        {
          id: 'gauntlet-mini',
          name: 'Gauntlet Mini',
          description: 'Small account challenge',
          maxLoss: '$1,500',
          profitTarget: '$3,000',
          maxContracts: '3',
          available: true
        },
        {
          id: 'gauntlet-standard',
          name: 'Gauntlet Standard',
          description: 'Most popular challenge',
          maxLoss: '$2,500',
          profitTarget: '$5,000',
          maxContracts: '6',
          available: true
        }
      ]
    },
    {
      id: 'ftmo',
      name: 'FTMO',
      logo: 'FT',
      accounts: [
        {
          id: 'challenge-10k',
          name: 'FTMO Challenge $10K',
          description: 'Forex challenge',
          maxLoss: '$1,000',
          profitTarget: '$1,000',
          maxContracts: 'N/A',
          available: false
        }
      ]
    },
    {
      id: 'apex',
      name: 'Apex Trader Funding',
      logo: 'ATF',
      accounts: [
        {
          id: 'evaluation-50k',
          name: '$50K Evaluation',
          description: 'Standard futures evaluation',
          maxLoss: '$2,000',
          profitTarget: '$3,000',
          maxContracts: '10',
          available: false
        }
      ]
    }
  ]

  const selectedFirmData = propFirms.find(firm => firm.id === selectedFirm)
  const selectedAccountData = selectedFirmData?.accounts.find(acc => acc.id === selectedAccount)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Connect Your Prop Firm Account</h2>
        <p className="text-large text-secondary-600 max-w-2xl mx-auto">
          Select your prop firm and evaluation account to set up automated compliance monitoring 
          with your TradingView strategies.
        </p>
      </div>

      {/* Step 1: Select Prop Firm */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-secondary-900">Step 1: Select Your Prop Firm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propFirms.map((firm) => (
            <button
              key={firm.id}
              onClick={() => {
                setSelectedFirm(firm.id)
                setSelectedAccount('')
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedFirm === firm.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                  firm.accounts.some(acc => acc.available) 
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600' 
                    : 'bg-secondary-400'
                }`}>
                  {firm.logo}
                </div>
                <div>
                  <div className="font-semibold text-secondary-900">{firm.name}</div>
                  <div className="text-sm text-secondary-600">
                    {firm.accounts.length} account{firm.accounts.length > 1 ? 's' : ''} available
                  </div>
                </div>
              </div>
              
              {!firm.accounts.some(acc => acc.available) && (
                <div className="inline-flex px-2 py-1 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                  Coming Soon
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Account Type */}
      {selectedFirmData && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-secondary-900">
            Step 2: Select Your {selectedFirmData.name} Account
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedFirmData.accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                disabled={!account.available}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  !account.available
                    ? 'border-secondary-200 bg-secondary-50 opacity-60 cursor-not-allowed'
                    : selectedAccount === account.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-1">{account.name}</h4>
                    <p className="text-sm text-secondary-600">{account.description}</p>
                  </div>
                  {!account.available && (
                    <div className="inline-flex px-2 py-1 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                      Coming Soon
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Max Daily Loss:</span>
                    <span className="font-medium text-secondary-900">{account.maxLoss}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Profit Target:</span>
                    <span className="font-medium text-secondary-900">{account.profitTarget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Max Contracts:</span>
                    <span className="font-medium text-secondary-900">{account.maxContracts}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Account Summary & TradingView Integration */}
      {selectedAccountData && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-secondary-900">Step 3: TradingView Integration</h3>
          
          {/* Account Summary */}
          <div className="card-premium bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-1">
                  Selected: {selectedFirmData?.name} - {selectedAccountData.name}
                </h4>
                <p className="text-sm text-secondary-600">
                  Your compliance rules will be automatically configured based on this account type.
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-success-100 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-success-700">Ready to Connect</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/50 rounded-lg p-3">
                <div className="text-sm text-secondary-600 mb-1">Daily Loss Limit</div>
                <div className="font-semibold text-secondary-900">{selectedAccountData.maxLoss}</div>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="text-sm text-secondary-600 mb-1">Profit Target</div>
                <div className="font-semibold text-secondary-900">{selectedAccountData.profitTarget}</div>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="text-sm text-secondary-600 mb-1">Max Contracts</div>
                <div className="font-semibold text-secondary-900">{selectedAccountData.maxContracts}</div>
              </div>
            </div>
          </div>

          {/* TradingView Webhook Setup */}
          <div className="card-premium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                TV
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900">TradingView Webhook URL</h4>
                <p className="text-sm text-secondary-600">Use this URL in your TradingView alerts</p>
              </div>
            </div>

            <div className="bg-secondary-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-secondary-700 break-all">
                  https://fundedsafe.com/api/webhooks/tradingview?account={selectedAccount}
                </code>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`https://fundedsafe.com/api/webhooks/tradingview?account=${selectedAccount}`)}>
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-secondary-600">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary-600">1</span>
                </div>
                <span>Copy the webhook URL above</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary-600">2</span>
                </div>
                <span>Go to your TradingView strategy alerts</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary-600">3</span>
                </div>
                <span>Paste the URL in the webhook field</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary-600">4</span>
                </div>
                <span>Your trades will be automatically monitored for compliance!</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Complete Setup & Start Monitoring
            </Button>
            <Button size="lg" variant="outline">
              View Setup Guide
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}