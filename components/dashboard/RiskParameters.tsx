'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface RiskRule {
  id: string
  name: string
  type: 'per_trade' | 'daily' | 'weekly' | 'monthly'
  maxRisk: number
  currentRisk: number
  enabled: boolean
  unit: '$' | '%'
}

interface RiskParametersProps {
  accountBalance: number
  dailyPnL: number
  weeklyPnL?: number
  monthlyPnL?: number
  onUpdateRiskRules: (rules: RiskRule[]) => void
  className?: string
}

export default function RiskParameters({
  accountBalance,
  dailyPnL,
  weeklyPnL = 0,
  monthlyPnL = 0,
  onUpdateRiskRules,
  className = ''
}: RiskParametersProps) {
  
  const [riskRules, setRiskRules] = useState<RiskRule[]>([
    {
      id: 'per_trade_dollar',
      name: 'Max Risk Per Trade',
      type: 'per_trade',
      maxRisk: 500,
      currentRisk: 0,
      enabled: true,
      unit: '$'
    },
    {
      id: 'per_trade_percent',
      name: 'Max Risk Per Trade (%)',
      type: 'per_trade',
      maxRisk: 2,
      currentRisk: 0,
      enabled: false,
      unit: '%'
    },
    {
      id: 'daily_loss',
      name: 'Daily Loss Limit',
      type: 'daily',
      maxRisk: 1000,
      currentRisk: Math.abs(Math.min(0, dailyPnL)),
      enabled: true,
      unit: '$'
    },
    {
      id: 'daily_loss_percent',
      name: 'Daily Loss Limit (%)',
      type: 'daily',
      maxRisk: 3,
      currentRisk: Math.abs(Math.min(0, (dailyPnL / accountBalance) * 100)),
      enabled: false,
      unit: '%'
    }
  ])

  const [editMode, setEditMode] = useState(false)
  const [tempRules, setTempRules] = useState<RiskRule[]>(riskRules)

  useEffect(() => {
    const updatedRules = riskRules.map(rule => {
      switch (rule.type) {
        case 'daily':
          return {
            ...rule,
            currentRisk: rule.unit === '$' 
              ? Math.abs(Math.min(0, dailyPnL))
              : Math.abs(Math.min(0, (dailyPnL / accountBalance) * 100))
          }
        case 'weekly':
          return {
            ...rule,
            currentRisk: rule.unit === '$'
              ? Math.abs(Math.min(0, weeklyPnL))
              : Math.abs(Math.min(0, (weeklyPnL / accountBalance) * 100))
          }
        case 'monthly':
          return {
            ...rule,
            currentRisk: rule.unit === '$'
              ? Math.abs(Math.min(0, monthlyPnL))
              : Math.abs(Math.min(0, (monthlyPnL / accountBalance) * 100))
          }
        default:
          return rule
      }
    })
    
    setRiskRules(updatedRules)
  }, [dailyPnL, weeklyPnL, monthlyPnL, accountBalance])

  const handleSaveRules = () => {
    setRiskRules(tempRules)
    onUpdateRiskRules(tempRules)
    setEditMode(false)
  }

  const handleCancelEdit = () => {
    setTempRules(riskRules)
    setEditMode(false)
  }

  const updateTempRule = (id: string, updates: Partial<RiskRule>) => {
    setTempRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }

  const getRiskLevel = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return { level: 'critical', color: 'bg-error-500', textColor: 'text-error-600' }
    if (percentage >= 70) return { level: 'high', color: 'bg-warning-500', textColor: 'text-warning-600' }
    if (percentage >= 50) return { level: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    return { level: 'low', color: 'bg-success-500', textColor: 'text-success-600' }
  }

  const RiskBar = ({ rule }: { rule: RiskRule }) => {
    const percentage = Math.min(100, (rule.currentRisk / rule.maxRisk) * 100)
    const riskLevel = getRiskLevel(rule.currentRisk, rule.maxRisk)
    
    return (
      <div className={`p-4 rounded-lg border ${rule.enabled ? 'bg-white' : 'bg-secondary-50 opacity-60'}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-secondary-900">{rule.name}</h4>
            <p className="text-xs text-secondary-600 capitalize">{rule.type.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${riskLevel.textColor}`}>
              {rule.unit}{rule.currentRisk.toFixed(rule.unit === '%' ? 1 : 0)}
            </div>
            <div className="text-xs text-secondary-600">
              of {rule.unit}{rule.maxRisk.toFixed(rule.unit === '%' ? 1 : 0)}
            </div>
          </div>
        </div>
        
        {rule.enabled && (
          <>
            <div className="w-full bg-secondary-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${riskLevel.color} ${
                  percentage > 80 ? 'animate-pulse' : ''
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary-500">
              <span>0{rule.unit}</span>
              <span className={percentage > 80 ? riskLevel.textColor + ' font-medium' : ''}>
                {percentage.toFixed(1)}%
              </span>
              <span>{rule.maxRisk}{rule.unit}</span>
            </div>
          </>
        )}
      </div>
    )
  }

  const EditableRiskRule = ({ rule }: { rule: RiskRule }) => (
    <div className="p-4 border rounded-lg bg-white">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium text-secondary-900">{rule.name}</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) => updateTempRule(rule.id, { enabled: e.target.checked })}
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-600">Enabled</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Max Risk"
            type="number"
            value={rule.maxRisk}
            onChange={(e) => updateTempRule(rule.id, { maxRisk: parseFloat(e.target.value) || 0 })}
            disabled={!rule.enabled}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              value={rule.unit}
              onChange={(e) => updateTempRule(rule.id, { unit: e.target.value as '$' | '%' })}
              disabled={!rule.enabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="$">Dollar ($)</option>
              <option value="%">Percent (%)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const activeRules = riskRules.filter(rule => rule.enabled)
  const violatedRules = activeRules.filter(rule => rule.currentRisk >= rule.maxRisk)

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Risk Parameters</h3>
          <p className="text-sm text-secondary-600">Set and monitor your risk limits</p>
        </div>
        <div className="flex items-center space-x-2">
          {violatedRules.length > 0 && (
            <div className="px-2 py-1 bg-error-100 text-error-700 text-xs rounded-full">
              {violatedRules.length} violation{violatedRules.length > 1 ? 's' : ''}
            </div>
          )}
          <Button
            size="sm"
            variant={editMode ? "secondary" : "outline"}
            onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
          {editMode && (
            <Button size="sm" onClick={handleSaveRules}>
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Risk Rules */}
      <div className="space-y-4">
        {editMode ? (
          <>
            {tempRules.map(rule => (
              <EditableRiskRule key={rule.id} rule={rule} />
            ))}
          </>
        ) : (
          <>
            {riskRules.map(rule => (
              <RiskBar key={rule.id} rule={rule} />
            ))}
          </>
        )}
      </div>

      {/* Summary */}
      {!editMode && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-secondary-900">
                {activeRules.length}
              </div>
              <div className="text-xs text-secondary-600">Active Rules</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${violatedRules.length > 0 ? 'text-error-600' : 'text-success-600'}`}>
                {violatedRules.length}
              </div>
              <div className="text-xs text-secondary-600">Violations</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-secondary-900">
                {activeRules.filter(rule => (rule.currentRisk / rule.maxRisk) > 0.7).length}
              </div>
              <div className="text-xs text-secondary-600">At Risk</div>
            </div>
          </div>
        </div>
      )}

      {/* Violations Alert */}
      {violatedRules.length > 0 && !editMode && (
        <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-error-500 text-xl">⚠️</div>
            <div>
              <h4 className="font-medium text-error-900 mb-1">Risk Limit Exceeded</h4>
              <div className="text-sm text-error-700 space-y-1">
                {violatedRules.map(rule => (
                  <div key={rule.id}>
                    • {rule.name}: {rule.unit}{rule.currentRisk.toFixed(rule.unit === '%' ? 1 : 0)} / {rule.unit}{rule.maxRisk.toFixed(rule.unit === '%' ? 1 : 0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}