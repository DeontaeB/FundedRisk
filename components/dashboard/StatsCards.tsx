'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  totalTrades: number
  complianceScore: number
  activeAlerts: number
  dailyPnL: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalTrades: 0,
    complianceScore: 0,
    activeAlerts: 0,
    dailyPnL: 0,
  })

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Mock data for development
        setStats({
          totalTrades: 24,
          complianceScore: 95,
          activeAlerts: 2,
          dailyPnL: 1250.50,
        })
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: '📈',
      color: 'blue',
    },
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      icon: '✅',
      color: stats.complianceScore >= 90 ? 'green' : stats.complianceScore >= 70 ? 'yellow' : 'red',
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts.toString(),
      icon: '🚨',
      color: stats.activeAlerts === 0 ? 'green' : 'red',
    },
    {
      title: 'Daily P&L',
      value: `$${stats.dailyPnL.toFixed(2)}`,
      icon: stats.dailyPnL >= 0 ? '💰' : '📉',
      color: stats.dailyPnL >= 0 ? 'green' : 'red',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={card.title} className="card-premium hover:shadow-premium transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              card.color === 'green' ? 'bg-success-100' :
              card.color === 'red' ? 'bg-error-100' :
              card.color === 'yellow' ? 'bg-warning-100' :
              'bg-primary-100'
            } group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              card.color === 'green' ? 'text-success-700 bg-success-100' :
              card.color === 'red' ? 'text-error-700 bg-error-100' :
              card.color === 'yellow' ? 'text-warning-700 bg-warning-100' :
              'text-primary-700 bg-primary-100'
            }`}>
              {index === 0 ? 'Today' : index === 1 ? 'Live' : index === 2 ? 'Active' : 'Daily'}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600 mb-2">{card.title}</p>
            <p className={`text-3xl font-bold ${
              card.color === 'green' ? 'text-success-600' :
              card.color === 'red' ? 'text-error-600' :
              card.color === 'yellow' ? 'text-warning-600' :
              'text-primary-600'
            }`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}