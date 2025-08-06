'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface WebhookStatus {
  webhookUrl: string
  isActive: boolean
  lastPing?: string
  totalAlerts: number
  recentAlerts: Array<{
    id: string
    symbol: string
    action: string
    status: string
    createdAt: string
    isViolation: boolean
  }>
}

export default function WebhookStatus() {
  const [status, setStatus] = useState<WebhookStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchWebhookStatus()
  }, [])

  const fetchWebhookStatus = async () => {
    try {
      const response = await fetch('/api/dashboard/webhook-status')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching webhook status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/test/webhook', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Test webhook sent successfully! Check your recent alerts.')
        fetchWebhookStatus() // Refresh status
      } else {
        alert('Test failed: ' + data.error)
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      alert('Test failed. Please try again.')
    } finally {
      setTesting(false)
    }
  }

  const copyWebhookUrl = () => {
    if (status?.webhookUrl) {
      navigator.clipboard.writeText(status.webhookUrl)
      alert('Webhook URL copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-secondary-200 rounded"></div>
          <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="card border-warning-200 bg-warning-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-warning-500 rounded-full flex items-center justify-center text-white">
            ⚠️
          </div>
          <div>
            <h3 className="font-semibold text-warning-900">Webhook Not Configured</h3>
            <p className="text-sm text-warning-700">Complete your setup to start monitoring trades</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/onboarding'}>
          Complete Setup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Webhook URL Card */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">TradingView Webhook</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            status.isActive
              ? 'bg-success-100 text-success-700'
              : 'bg-error-100 text-error-700'
          }`}>
            {status.isActive ? '🟢 Active' : '🔴 Inactive'}
          </div>
        </div>

        <div className="bg-secondary-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-secondary-700">Your Webhook URL:</label>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={testWebhook} disabled={testing}>
                {testing ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>
          <code className="text-sm font-mono text-secondary-700 break-all bg-white p-2 rounded block border">
            {status.webhookUrl}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary-600">{status.totalAlerts}</div>
            <div className="text-sm text-secondary-600">Total Alerts</div>
          </div>
          <div className="bg-success-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-success-600">
              {status.lastPing ? '✓' : '—'}
            </div>
            <div className="text-sm text-secondary-600">
              {status.lastPing ? 'Last Alert' : 'No Alerts Yet'}
            </div>
          </div>
        </div>

        {status.lastPing && (
          <div className="mt-3 text-xs text-secondary-500 text-center">
            Last activity: {new Date(status.lastPing).toLocaleString()}
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <h4 className="font-semibold text-secondary-900 mb-4">Recent Trading Alerts</h4>
        
        {status.recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No trading alerts yet</p>
            <p className="text-xs mt-1">Your TradingView alerts will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {status.recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    alert.isViolation
                      ? 'bg-error-500'
                      : alert.status === 'processed'
                      ? 'bg-success-500'
                      : 'bg-warning-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-secondary-900">
                      {alert.action.toUpperCase()} {alert.symbol}
                    </div>
                    <div className="text-xs text-secondary-600">
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.isViolation
                    ? 'bg-error-100 text-error-700'
                    : alert.status === 'processed'
                    ? 'bg-success-100 text-success-700'
                    : 'bg-warning-100 text-warning-700'
                }`}>
                  {alert.isViolation ? 'Blocked' : alert.status === 'processed' ? 'Executed' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="card border-primary-200 bg-primary-50">
        <h4 className="font-semibold text-primary-900 mb-3">📖 TradingView Integration Guide</h4>
        <div className="space-y-2 text-sm text-primary-800">
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[20px]">1.</span>
            <span>Go to your TradingView strategy or indicator alerts</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[20px]">2.</span>
            <span>In the "Webhook URL" field, paste your webhook URL above</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[20px]">3.</span>
            <span>Use this message format in your alert:</span>
          </div>
          <div className="ml-6 bg-white rounded p-2 font-mono text-xs">
            {`{
  "symbol": "{{ticker}}",
  "action": "buy",
  "quantity": 1,
  "price": {{close}}
}`}
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium min-w-[20px]">4.</span>
            <span>Save your alert and start trading with automatic compliance monitoring!</span>
          </div>
        </div>
      </div>
    </div>
  )
}