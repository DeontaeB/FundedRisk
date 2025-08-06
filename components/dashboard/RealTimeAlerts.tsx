'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

interface ComplianceAlert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'warning'
  ruleType?: string
  currentValue?: number
  limit?: number
  timestamp: string
  acknowledged?: boolean
}

interface RealTimeAlertsProps {
  maxAlerts?: number
}

export default function RealTimeAlerts({ maxAlerts = 5 }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { socket } = useNotifications()

  useEffect(() => {
    if (!socket) return

    const handleConnection = () => {
      setIsConnected(true)
    }

    const handleDisconnection = () => {
      setIsConnected(false)
    }

    const handleComplianceAlert = (alertData: any) => {
      const newAlert: ComplianceAlert = {
        id: alertData.id || `alert-${Date.now()}-${Math.random()}`,
        title: alertData.title,
        message: alertData.message,
        severity: alertData.severity || 'warning',
        ruleType: alertData.ruleType,
        currentValue: alertData.currentValue,
        limit: alertData.limit,
        timestamp: alertData.timestamp || new Date().toISOString(),
        acknowledged: false
      }

      setAlerts(prevAlerts => {
        const updatedAlerts = [newAlert, ...prevAlerts]
        return updatedAlerts.slice(0, maxAlerts)
      })

      // Play sound or show browser notification for high severity alerts
      if (alertData.severity === 'high') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('FundedSafe Alert', {
            body: alertData.message,
            icon: '/favicon.ico'
          })
        }
      }
    }

    // Socket event listeners
    socket.on('connect', handleConnection)
    socket.on('disconnect', handleDisconnection)
    socket.on('compliance-alert', handleComplianceAlert)

    // Check initial connection status
    setIsConnected(socket.connected)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      socket.off('connect', handleConnection)
      socket.off('disconnect', handleDisconnection)
      socket.off('compliance-alert', handleComplianceAlert)
    }
  }, [socket, maxAlerts])

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.filter(alert => alert.id !== alertId)
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50 text-red-800'
      case 'medium':
        return 'border-orange-500 bg-orange-50 text-orange-800'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'low':
        return 'border-blue-500 bg-blue-50 text-blue-800'
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🚨'
      case 'medium':
        return '⚠️'
      case 'warning':
        return '⚡'
      case 'low':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900 mr-3">Compliance Alerts</h3>
          {unacknowledgedCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {unacknowledgedCount}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Monitoring' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No alerts</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
                getSeverityColor(alert.severity)
              } ${
                alert.acknowledged ? 'opacity-60' : ''
              } ${
                index === 0 ? 'animate-pulse' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">
                    {getSeverityIcon(alert.severity)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                        alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    
                    {(alert.currentValue !== undefined && alert.limit !== undefined) && (
                      <div className="text-xs bg-white bg-opacity-50 rounded p-2 mb-2">
                        <span className="font-medium">Current: </span>
                        <span className={alert.currentValue > alert.limit ? 'text-red-600 font-bold' : ''}>
                          {alert.currentValue}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">Limit: </span>
                        <span>{alert.limit}</span>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-75">
                      {formatTime(alert.timestamp)}
                      {alert.ruleType && (
                        <span className="ml-2">• Rule: {alert.ruleType}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 ml-4">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2 py-1 text-xs bg-white bg-opacity-80 hover:bg-opacity-100 rounded border"
                    >
                      ✓ ACK
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2 py-1 text-xs bg-white bg-opacity-80 hover:bg-opacity-100 rounded border text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Total: {alerts.length} • Unacked: {unacknowledgedCount}
            </span>
            <button
              onClick={() => setAlerts([])}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}