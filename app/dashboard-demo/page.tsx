'use client'

import { useState } from 'react'
import AccountProgressMeter from '@/components/dashboard/AccountProgressMeter'
import EquityCurveChart from '@/components/dashboard/EquityCurveChart'
import WinRateStats from '@/components/dashboard/WinRateStats'
import RiskParameters from '@/components/dashboard/RiskParameters'
import DailyBreakdown from '@/components/dashboard/DailyBreakdown'
import AlertSystem from '@/components/dashboard/AlertSystem'

// Sample data for demonstration
const sampleEquityData = [
  { timestamp: new Date('2024-01-01'), equity: 50000 },
  { timestamp: new Date('2024-01-02'), equity: 50250, trade: { symbol: 'ES', pnl: 250, side: 'buy' as const } },
  { timestamp: new Date('2024-01-03'), equity: 49800, trade: { symbol: 'NQ', pnl: -450, side: 'sell' as const } },
  { timestamp: new Date('2024-01-04'), equity: 50300, trade: { symbol: 'ES', pnl: 500, side: 'buy' as const } },
  { timestamp: new Date('2024-01-05'), equity: 51100, trade: { symbol: 'NQ', pnl: 800, side: 'buy' as const } },
]

const sampleTrades = [
  {
    id: '1',
    symbol: 'ES',
    side: 'buy' as const,
    pnl: 250,
    quantity: 2,
    entryPrice: 4750,
    exitPrice: 4775,
    stopLoss: 4725,
    takeProfit: 4800,
    riskAmount: 500,
    timestamp: new Date('2024-01-02')
  },
  {
    id: '2',
    symbol: 'NQ',
    side: 'sell' as const,
    pnl: -450,
    quantity: 1,
    entryPrice: 16900,
    exitPrice: 16855,
    stopLoss: 16950,
    takeProfit: 16800,
    riskAmount: 500,
    timestamp: new Date('2024-01-03')
  },
  {
    id: '3',
    symbol: 'ES',
    side: 'buy' as const,
    pnl: 500,
    quantity: 2,
    entryPrice: 4760,
    exitPrice: 4785,
    stopLoss: 4735,
    takeProfit: 4810,
    riskAmount: 500,
    timestamp: new Date('2024-01-04')
  }
]

const sampleDailyData = [
  {
    date: new Date('2024-01-01'),
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
    volume: 0,
    bestTrade: 0,
    worstTrade: 0
  },
  {
    date: new Date('2024-01-02'),
    pnl: 250,
    trades: 1,
    wins: 1,
    losses: 0,
    volume: 2,
    bestTrade: 250,
    worstTrade: 250
  },
  {
    date: new Date('2024-01-03'),
    pnl: -450,
    trades: 1,
    wins: 0,
    losses: 1,
    volume: 1,
    bestTrade: -450,
    worstTrade: -450
  },
  {
    date: new Date('2024-01-04'),
    pnl: 500,
    trades: 1,
    wins: 1,
    losses: 0,
    volume: 2,
    bestTrade: 500,
    worstTrade: 500
  }
]

export default function DashboardDemo() {
  const [alerts, setAlerts] = useState<any[]>([])

  const handleAlert = (alert: any) => {
    console.log('New alert triggered:', alert)
    setAlerts(prev => [alert, ...prev])
  }

  const handleUpdateRiskRules = (rules: any[]) => {
    console.log('Risk rules updated:', rules)
  }

  const currentData = {
    dailyPnL: 300,
    consecutiveLosses: 1,
    drawdownPercent: 2.5,
    winStreak: 2,
    accountBalance: 51100,
    dailyTrades: 3
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
            <div className="text-sm text-secondary-600">
              Dashboard Demo - Advanced Components
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="heading-lg mb-4">Trading Dashboard</h1>
            <p className="text-large text-secondary-600">
              Advanced risk management and performance analytics for prop firm traders
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Account Progress Meter */}
              <AccountProgressMeter
                currentBalance={51100}
                startingBalance={50000}
                targetProfit={5000}
                maxDrawdown={2500}
                dailyLossLimit={1000}
                currentDailyLoss={0}
                accountType="evaluation"
              />

              {/* Equity Curve Chart */}
              <EquityCurveChart
                equityData={sampleEquityData}
                startingBalance={50000}
                targetProfit={5000}
                maxDrawdown={2500}
              />

              {/* Daily Breakdown */}
              <DailyBreakdown
                dailyData={sampleDailyData}
              />

            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Win Rate Stats */}
              <WinRateStats
                trades={sampleTrades}
              />

              {/* Risk Parameters */}
              <RiskParameters
                accountBalance={51100}
                dailyPnL={300}
                weeklyPnL={300}
                monthlyPnL={1100}
                onUpdateRiskRules={handleUpdateRiskRules}
              />

              {/* Alert System */}
              <AlertSystem
                currentData={currentData}
                onTriggerAlert={handleAlert}
              />

            </div>
          </div>

          {/* Component Documentation */}
          <div className="mt-12 card">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">🎯 Dashboard Components Overview</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Account Progress Meter</h3>
                  <p className="text-secondary-600">Visual progress tracking for prop firm challenges with profit targets, drawdown limits, and daily loss monitoring.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Equity Curve Chart</h3>
                  <p className="text-secondary-600">Real-time equity tracking with SVG-based line chart, trade markers, and performance statistics.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Win Rate & RR Stats</h3>
                  <p className="text-secondary-600">Comprehensive trading statistics including win rate, risk-to-reward ratios, profit factor, and streak tracking.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Risk Parameters</h3>
                  <p className="text-secondary-600">Configurable risk management with per-trade limits, daily/weekly/monthly loss limits, and visual risk meters.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Daily Breakdown</h3>
                  <p className="text-secondary-600">Calendar and list view of daily trading performance with P&L, trade counts, and win/loss tracking.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-600 mb-2">Alert System</h3>
                  <p className="text-secondary-600">Customizable alert rules with visual, audio, email, and SMS notifications. Real-time monitoring and acknowledgment system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}