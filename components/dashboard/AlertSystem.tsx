'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AlertRule {
  id: string
  name: string
  type: 'daily_loss' | 'consecutive_losses' | 'drawdown' | 'win_streak' | 'profit_target' | 'trade_count'
  condition: 'greater_than' | 'less_than' | 'equals'
  value: number
  unit: '$' | '%' | 'trades' | 'count'
  enabled: boolean
  notificationTypes: ('visual' | 'audio' | 'email' | 'sms')[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastTriggered?: Date
  description: string
}

interface ActiveAlert {
  id: string
  ruleId: string
  ruleName: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  acknowledged: boolean
}

interface AlertSystemProps {
  currentData: {
    dailyPnL: number
    consecutiveLosses: number
    drawdownPercent: number
    winStreak: number
    accountBalance: number
    dailyTrades: number
  }
  onTriggerAlert: (alert: ActiveAlert) => void
  className?: string
}

export default function AlertSystem({ 
  currentData, 
  onTriggerAlert, 
  className = '' 
}: AlertSystemProps) {
  
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'daily_loss_4_percent',
      name: 'Daily Loss 4%',
      type: 'daily_loss',
      condition: 'greater_than',
      value: 4,
      unit: '%',
      enabled: true,
      notificationTypes: ['visual', 'audio'],
      priority: 'high',
      description: 'Alert when daily loss exceeds 4% of account'
    },
    {
      id: 'consecutive_3_losses',
      name: '3 Consecutive Losses',
      type: 'consecutive_losses',
      condition: 'greater_than',
      value: 3,
      unit: 'count',
      enabled: true,
      notificationTypes: ['visual', 'audio'],
      priority: 'medium',
      description: 'Alert after 3 losing trades in a row'
    },
    {
      id: 'max_drawdown_8_percent',
      name: 'Max Drawdown 8%',
      type: 'drawdown',
      condition: 'greater_than',
      value: 8,
      unit: '%',
      enabled: true,
      notificationTypes: ['visual', 'audio', 'email'],
      priority: 'critical',
      description: 'Critical alert for high drawdown'
    }
  ])

  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([])
  const [showAddRule, setShowAddRule] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Check alert conditions
  const checkAlerts = useCallback(() => {
    alertRules.forEach(rule => {
      if (!rule.enabled) return

      let currentValue = 0
      let shouldTrigger = false

      switch (rule.type) {
        case 'daily_loss':
          currentValue = rule.unit === '%' 
            ? Math.abs(Math.min(0, (currentData.dailyPnL / currentData.accountBalance) * 100))
            : Math.abs(Math.min(0, currentData.dailyPnL))
          break
        case 'consecutive_losses':
          currentValue = currentData.consecutiveLosses
          break
        case 'drawdown':
          currentValue = currentData.drawdownPercent
          break
        case 'win_streak':
          currentValue = currentData.winStreak
          break
        case 'trade_count':
          currentValue = currentData.dailyTrades
          break
      }

      switch (rule.condition) {
        case 'greater_than':
          shouldTrigger = currentValue > rule.value
          break
        case 'less_than':
          shouldTrigger = currentValue < rule.value
          break
        case 'equals':
          shouldTrigger = currentValue === rule.value
          break
      }

      if (shouldTrigger) {
        // Check if this alert was recently triggered (avoid spam)
        const recentTrigger = rule.lastTriggered && 
          (Date.now() - rule.lastTriggered.getTime()) < 60000 // 1 minute cooldown

        if (!recentTrigger) {
          const newAlert: ActiveAlert = {
            id: `${rule.id}_${Date.now()}`,
            ruleId: rule.id,
            ruleName: rule.name,
            message: `${rule.name}: ${currentValue}${rule.unit} ${rule.condition.replace('_', ' ')} ${rule.value}${rule.unit}`,
            priority: rule.priority,
            timestamp: new Date(),
            acknowledged: false
          }

          setActiveAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep last 10 alerts
          onTriggerAlert(newAlert)

          // Update last triggered time
          setAlertRules(prev => prev.map(r => 
            r.id === rule.id ? { ...r, lastTriggered: new Date() } : r
          ))

          // Play sound if enabled
          if (audioEnabled && rule.notificationTypes.includes('audio')) {
            playAlertSound(rule.priority)
          }
        }
      }
    })
  }, [currentData, alertRules, audioEnabled, onTriggerAlert])

  useEffect(() => {
    checkAlerts()
  }, [checkAlerts])

  const playAlertSound = (priority: string) => {
    // Create audio context and play different tones based on priority
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different priorities
      const frequencies = {
        low: 440,
        medium: 660,
        high: 880,
        critical: 1100
      }

      oscillator.frequency.setValueAtTime(frequencies[priority as keyof typeof frequencies] || 440, audioContext.currentTime)
      oscillator.type = priority === 'critical' ? 'sawtooth' : 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('Audio alert failed:', error)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const clearAllAlerts = () => {
    setActiveAlerts([])
  }

  const addNewRule = (rule: Omit<AlertRule, 'id'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `custom_${Date.now()}`
    }
    setAlertRules(prev => [...prev, newRule])
    setShowAddRule(false)
  }

  const updateRule = (id: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }

  const deleteRule = (id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-error-100 border-error-300 text-error-800'
      case 'high': return 'bg-warning-100 border-warning-300 text-warning-800'
      case 'medium': return 'bg-blue-100 border-blue-300 text-blue-800'
      default: return 'bg-secondary-100 border-secondary-300 text-secondary-800'
    }
  }

  const unacknowledgedAlerts = activeAlerts.filter(alert => !alert.acknowledged)

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Alert System</h3>
          <p className="text-sm text-secondary-600">Automated risk monitoring & notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          {unacknowledgedAlerts.length > 0 && (
            <div className="px-2 py-1 bg-error-100 text-error-700 text-xs rounded-full animate-pulse">
              {unacknowledgedAlerts.length} active
            </div>
          )}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg ${audioEnabled ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'}`}
            title={`Audio alerts ${audioEnabled ? 'enabled' : 'disabled'}`}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-secondary-900">Active Alerts</h4>
            <Button size="sm" variant="outline" onClick={clearAllAlerts}>
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{alert.ruleName}</div>
                    <div className="text-sm opacity-80">{alert.message}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-2"
                    >
                      ✓
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Rules */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-secondary-900">Alert Rules</h4>
          <Button size="sm" onClick={() => setShowAddRule(true)}>
            Add Rule
          </Button>
        </div>

        {alertRules.map(rule => (
          <div key={rule.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-secondary-900">{rule.name}</div>
                    <div className="text-sm text-secondary-600">{rule.description}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(rule.priority)}`}>
                  {rule.priority}
                </span>
                <Button size="sm" variant="outline" onClick={() => deleteRule(rule.id)}>
                  ×
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-secondary-600 ml-6">
              Trigger when {rule.type.replace('_', ' ')} {rule.condition.replace('_', ' ')} {rule.value}{rule.unit}
            </div>
            
            <div className="flex items-center space-x-2 ml-6 mt-2">
              {rule.notificationTypes.map(type => (
                <span key={type} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Form */}
      {showAddRule && (
        <div className="mt-6 p-4 border-2 border-dashed border-secondary-300 rounded-lg">
          <h4 className="font-medium text-secondary-900 mb-4">Add New Alert Rule</h4>
          {/* Simplified form - in production, this would be more comprehensive */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Rule Name" placeholder="My Custom Alert" />
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="daily_loss">Daily Loss</option>
              <option value="consecutive_losses">Consecutive Losses</option>
              <option value="drawdown">Drawdown</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => setShowAddRule(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowAddRule(false)}>
              Add Rule
            </Button>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {alertRules.filter(r => r.enabled).length}
            </div>
            <div className="text-secondary-600">Active Rules</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {activeAlerts.length}
            </div>
            <div className="text-secondary-600">Total Alerts</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${audioEnabled ? 'text-success-600' : 'text-secondary-400'}`}>
              {audioEnabled ? '🔊' : '🔇'}
            </div>
            <div className="text-secondary-600">Audio Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}