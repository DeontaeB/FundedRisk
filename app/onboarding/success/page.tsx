'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function OnboardingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      checkUserStatus()
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()
      
      if (data.success) {
        // Payment verified, check user status
        await checkUserStatus()
      } else {
        setError('Payment verification failed')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setError('Error verifying payment')
    }
  }

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user/status')
      const data = await response.json()
      
      if (data.success) {
        setUserData(data.data)
      } else {
        setError('Failed to load account information')
      }
    } catch (error) {
      console.error('Error checking user status:', error)
      setError('Error loading account information')
    } finally {
      setLoading(false)
    }
  }

  const copyWebhookUrl = () => {
    if (userData?.webhookUrl) {
      navigator.clipboard.writeText(userData.webhookUrl)
      alert('Webhook URL copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-error-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Setup Error</h1>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/onboarding')}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-secondary-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold font-display text-secondary-900">PropRuleTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-success-600 font-medium">
                ✅ Setup Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 animate-bounce">
              🎉
            </div>
            <h1 className="heading-lg mb-4">Welcome to PropRuleTracker!</h1>
            <p className="text-large text-secondary-600 max-w-2xl mx-auto">
              Your account is now active and ready to protect your prop firm trading. 
              Let's get your TradingView alerts connected.
            </p>
          </div>

          {/* Account Summary */}
          {userData && (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Subscription Info */}
              <div className="card-premium bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
                <h3 className="font-semibold text-secondary-900 mb-4">Your Subscription</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Plan:</span>
                    <span className="font-medium text-secondary-900">
                      {userData.subscription?.priceId?.includes('professional') ? 'Professional' : 'Starter'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userData.subscription?.status === 'trialing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-success-100 text-success-700'
                    }`}>
                      {userData.subscription?.status === 'trialing' ? '🆓 Free Trial' : '🟢 Active'}
                    </span>
                  </div>
                  {userData.subscription?.status === 'trialing' && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Trial Ends:</span>
                      <span className="font-medium text-secondary-900">
                        {new Date(userData.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connected Account */}
              <div className="card">
                <h3 className="font-semibold text-secondary-900 mb-4">Connected Account</h3>
                {userData.accounts.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Prop Firm:</span>
                      <span className="font-medium text-secondary-900">
                        {userData.accounts[0].propFirmAccount.propFirm.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Account Type:</span>
                      <span className="font-medium text-secondary-900">
                        {userData.accounts[0].propFirmAccount.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Account Size:</span>
                      <span className="font-medium text-secondary-900">
                        ${userData.accounts[0].propFirmAccount.accountSize.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-secondary-600 text-sm">No accounts connected</p>
                )}
              </div>
            </div>
          )}

          {/* Webhook Setup */}
          <div className="card-premium mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Your TradingView Webhook URL</h3>
              <p className="text-secondary-600">
                Copy this URL and add it to your TradingView strategy alerts
              </p>
            </div>

            {userData?.webhookUrl ? (
              <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-secondary-700">Webhook URL:</label>
                  <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                    Copy URL
                  </Button>
                </div>
                <code className="text-sm font-mono text-secondary-700 break-all bg-white p-2 rounded block border">
                  {userData.webhookUrl}
                </code>
              </div>
            ) : (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
                <p className="text-warning-700 text-sm">
                  Webhook URL is being generated. Please refresh in a moment.
                </p>
              </div>
            )}

            {/* Integration Steps */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h4 className="font-semibold text-primary-900 mb-4">📖 Quick Setup Guide</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-primary-900">Copy your webhook URL above</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-primary-900">Go to TradingView → Alerts → Create Alert</p>
                    <p className="text-primary-700 text-xs">For your trading strategy or indicator</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-primary-900">Enable "Webhook URL" and paste your URL</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                  <div>
                    <p className="font-medium text-primary-900">Use this message format:</p>
                    <div className="bg-white rounded p-2 font-mono text-xs mt-1 border">
{`{
  "symbol": "{{ticker}}",
  "action": "buy",
  "quantity": 1,
  "price": {{close}}
}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                  <div>
                    <p className="font-medium text-success-900">Save your alert and start trading with protection!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="px-8"
            >
              Go to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://www.tradingview.com/chart/', '_blank')}
              >
                Open TradingView →
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/help/setup-guide')}
              >
                View Detailed Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}