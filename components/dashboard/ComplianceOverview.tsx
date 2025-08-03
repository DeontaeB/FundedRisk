'use client'

import { useEffect, useState } from 'react'

interface ComplianceRule {
  id: string
  name: string
  status: 'compliant' | 'warning' | 'violation'
  description: string
  threshold: number
  current: number
}

export default function ComplianceOverview() {
  const [rules, setRules] = useState<ComplianceRule[]>([])

  useEffect(() => {
    // Mock compliance rules
    setRules([
      {
        id: '1',
        name: 'Daily Loss Limit',
        status: 'compliant',
        description: 'Maximum daily loss should not exceed $500',
        threshold: 500,
        current: 150,
      },
      {
        id: '2',
        name: 'Position Size',
        status: 'warning',
        description: 'Position size should not exceed 2% of account',
        threshold: 2,
        current: 1.8,
      },
      {
        id: '3',
        name: 'Trading Hours',
        status: 'compliant',
        description: 'Trading only during market hours',
        threshold: 100,
        current: 100,
      },
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'violation':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'violation':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Compliance Overview</h3>
        <span className="text-sm text-gray-500">Real-time</span>
      </div>
      
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl mr-3">{getStatusIcon(rule.status)}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                {rule.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Current: {rule.current}{rule.name.includes('Loss') ? '$' : rule.name.includes('Size') ? '%' : ''}</span>
                <span>Limit: {rule.threshold}{rule.name.includes('Loss') ? '$' : rule.name.includes('Size') ? '%' : ''}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    rule.status === 'compliant' ? 'bg-green-600' :
                    rule.status === 'warning' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min((rule.current / rule.threshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}