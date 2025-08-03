'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Mock alerts
    setAlerts([
      {
        id: '1',
        type: 'warning',
        title: 'Position Size Warning',
        message: 'Your current position size is approaching the 2% limit',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Daily Target Reached',
        message: 'You have reached 80% of your daily profit target',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: true,
      },
      {
        id: '3',
        type: 'error',
        title: 'Trading Hours Violation',
        message: 'Trade executed outside of allowed trading hours',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isRead: false,
      },
    ])
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'error':
        return '🚨'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No alerts at this time</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 ${getAlertColor(alert.type)} ${
                !alert.isRead ? 'border-l-4' : ''
              }`}
            >
              <div className="flex items-start">
                <span className="text-lg mr-3 mt-0.5">{getAlertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium text-sm ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alert.title}
                    </h4>
                    <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}