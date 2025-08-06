'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function BillingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [session])

  const fetchSubscriptionData = async () => {
    if (!session) return

    try {
      const response = await fetch('/api/stripe/subscription')
      const data = await response.json()
      
      if (data.success) {
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!session) return

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/settings/billing`
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        console.error('Error creating checkout session:', data.error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings/billing`
        })
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        console.error('Error creating portal session:', data.error)
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        {/* Current Subscription Status */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Current Plan</h3>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">FundedSafe Pro</p>
                  <p className="text-sm text-gray-600">
                    $24.99/month • Status: {subscription.status}
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-gray-600">
                      Next billing: {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-sm text-amber-600 font-medium">
                      ⚠️ Subscription will cancel at period end
                    </p>
                  )}
                </div>
                <Button onClick={handleManageBilling} variant="outline" disabled={loading}>
                  {loading ? 'Loading...' : 'Manage Billing'}
                </Button>
              </div>

              {/* Plan Features */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Your plan includes:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time compliance monitoring
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    TradingView webhook integration
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Email & SMS alerts
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Advanced analytics dashboard
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited trades tracking
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Multiple prop firm accounts
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Custom risk rules
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    API access
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">No Active Subscription</h4>
                <p className="text-gray-600 mb-6">
                  Subscribe to FundedSafe Pro to protect your prop firm account
                </p>
              </div>

              {/* Universal Plan Card */}
              <div className="max-w-md mx-auto border rounded-lg p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
                <div className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full mb-4 inline-block">
                  EVERYTHING INCLUDED
                </div>
                
                <h4 className="text-xl font-semibold mb-2">FundedSafe Pro</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">$24.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Only $0.83/day - less than a coffee
                </p>

                <ul className="text-sm space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time compliance monitoring
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Email & SMS alerts
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited trades tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  variant="primary"
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </Button>
                
                <p className="text-xs text-gray-600 mt-3">
                  7-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Billing History */}
        {subscription && (
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Billing History</h3>
            <p className="text-sm text-gray-600">
              View detailed billing history and download invoices in the billing portal.
            </p>
            <div className="mt-4">
              <Button onClick={handleManageBilling} variant="outline" disabled={loading}>
                {loading ? 'Loading...' : 'View Billing History'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}