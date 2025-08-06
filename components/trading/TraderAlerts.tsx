'use client'

import { useState, useEffect, useCallback } from 'react'

interface Alert {
  id: string
  type: 'VIOLATION' | 'WARNING' | 'INFO'
  message: string
  timestamp: Date
  acknowledged: boolean
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  autoAck?: boolean // Auto-acknowledge after time
}

interface TraderAlertsProps {
  currentData: {
    dailyPnL: number
    consecutiveLosses: number
    drawdownPercent: number
    accountBalance: number
    dailyTrades: number
    dailyLossLimit: number
  }
  className?: string
}

export default function TraderAlerts({ currentData, className = '' }: TraderAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // Check for violations and generate alerts
  const checkViolations = useCallback(() => {
    const newAlerts: Alert[] = []
    const dailyLossUsed = Math.abs(Math.min(0, currentData.dailyPnL))
    const dailyLossPercent = (dailyLossUsed / currentData.dailyLossLimit) * 100

    // Critical violations
    if (dailyLossPercent >= 90) {
      newAlerts.push({
        id: 'daily_loss_critical',
        type: 'VIOLATION',
        message: `DAILY LOSS AT ${dailyLossPercent.toFixed(0)}% - STOP TRADING`,
        timestamp: new Date(),
        acknowledged: false,
        priority: 'CRITICAL'
      })
    }

    if (currentData.drawdownPercent >= 80) {
      newAlerts.push({
        id: 'drawdown_critical',
        type: 'VIOLATION',
        message: `DRAWDOWN AT ${currentData.drawdownPercent.toFixed(0)}% - RISK LIMIT EXCEEDED`,
        timestamp: new Date(),
        acknowledged: false,
        priority: 'CRITICAL'
      })
    }

    if (currentData.consecutiveLosses >= 4) {
      newAlerts.push({
        id: 'consecutive_losses',
        type: 'VIOLATION',
        message: `${currentData.consecutiveLosses} CONSECUTIVE LOSSES - TAKE A BREAK`,
        timestamp: new Date(),
        acknowledged: false,
        priority: 'HIGH'
      })
    }

    // High priority warnings
    if (dailyLossPercent >= 70 && dailyLossPercent < 90) {
      newAlerts.push({
        id: 'daily_loss_warning',
        type: 'WARNING',
        message: `Daily loss at ${dailyLossPercent.toFixed(0)}% - Reduce position size`,
        timestamp: new Date(),
        acknowledged: false,
        priority: 'HIGH'
      })
    }

    if (currentData.dailyTrades >= 10) {
      newAlerts.push({
        id: 'overtrading',
        type: 'WARNING',
        message: `${currentData.dailyTrades} trades today - Watch for overtrading`,
        timestamp: new Date(),
        acknowledged: false,
        priority: 'MEDIUM',
        autoAck: true
      })
    }

    // Add new alerts that don't already exist
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id))
      const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id))
      
      if (uniqueNewAlerts.length > 0 && soundEnabled) {
        playAlertSound(uniqueNewAlerts[0].priority)
      }
      
      return [...prev, ...uniqueNewAlerts].slice(-10) // Keep last 10 alerts
    })
  }, [currentData, soundEnabled])

  useEffect(() => {
    checkViolations()
  }, [checkViolations])

  // Auto-acknowledge alerts after 30 seconds
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoAck && !alert.acknowledged) {
        setTimeout(() => {
          acknowledgeAlert(alert.id)
        }, 30000)
      }
    })
  }, [alerts])

  const playAlertSound = (priority: string) => {
    if (!soundEnabled) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different sounds for different priorities
      const soundConfig = {
        'CRITICAL': { freq: 1000, type: 'square', duration: 1000, volume: 0.3 },
        'HIGH': { freq: 800, type: 'sine', duration: 500, volume: 0.2 },
        'MEDIUM': { freq: 600, type: 'sine', duration: 300, volume: 0.1 },
        'LOW': { freq: 400, type: 'sine', duration: 200, volume: 0.05 }
      }
      const config = soundConfig[priority as keyof typeof soundConfig] || soundConfig['LOW']

      oscillator.frequency.setValueAtTime(config.freq, audioContext.currentTime)
      oscillator.type = config.type as OscillatorType
      gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + config.duration / 1000)
    } catch (error) {
      console.warn('Audio alert failed:', error)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })))
  }

  const clearAll = () => {
    setAlerts([])
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key.toLowerCase()) {
        case ' ': // Space to acknowledge top alert
          e.preventDefault()
          const topAlert = alerts.find(a => !a.acknowledged)
          if (topAlert) acknowledgeAlert(topAlert.id)
          break
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            acknowledgeAll()
          }
          break
        case 'escape':
          clearAll()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [alerts])

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged)
  const displayAlerts = showAll ? alerts : alerts.slice(0, 5)

  const getAlertColor = (alert: Alert) => {
    if (alert.acknowledged) return 'bg-gray-800 border-gray-600 text-gray-400'
    
    switch (alert.priority) {
      case 'CRITICAL': return 'bg-red-900 border-red-500 text-red-100 animate-pulse'
      case 'HIGH': return 'bg-orange-900 border-orange-500 text-orange-100'
      case 'MEDIUM': return 'bg-yellow-900 border-yellow-500 text-yellow-100'
      default: return 'bg-blue-900 border-blue-500 text-blue-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIOLATION': return '🚨'
      case 'WARNING': return '⚠️'
      default: return 'ℹ️'
    }
  }

  return (
    <div className={`bg-gray-900 text-white border border-gray-700 rounded ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-gray-200">ALERTS</h3>
            {unacknowledgedAlerts.length > 0 && (
              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                {unacknowledgedAlerts.length}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 rounded text-xs ${soundEnabled ? 'text-green-400' : 'text-gray-500'}`}
              title="Toggle sound"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            
            {unacknowledgedAlerts.length > 0 && (
              <button
                onClick={acknowledgeAll}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
                title="Ctrl+A"
              >
                ACK ALL
              </button>
            )}
            
            <button
              onClick={clearAll}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold"
              title="ESC"
            >
              CLEAR
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          Press SPACE to acknowledge • ESC to clear
        </div>
      </div>

      {/* Alerts list */}
      <div className="max-h-64 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No alerts • All systems normal
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 border-l-4 ${getAlertColor(alert)} cursor-pointer hover:bg-opacity-80`}
                onClick={() => acknowledgeAlert(alert.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">{getTypeIcon(alert.type)}</span>
                    <div>
                      <div className="text-sm font-bold">
                        {alert.type}: {alert.message}
                      </div>
                      <div className="text-xs opacity-75">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs px-1 rounded ${
                      alert.priority === 'CRITICAL' ? 'bg-red-600' :
                      alert.priority === 'HIGH' ? 'bg-orange-600' :
                      alert.priority === 'MEDIUM' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    }`}>
                      {alert.priority}
                    </span>
                    
                    {!alert.acknowledged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          acknowledgeAlert(alert.id)
                        }}
                        className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 5 && (
          <div className="p-2 border-t border-gray-700 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-gray-400 hover:text-white"
            >
              {showAll ? 'Show Less' : `Show All (${alerts.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}