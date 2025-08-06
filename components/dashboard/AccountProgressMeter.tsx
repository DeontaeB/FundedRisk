'use client'

import { useMemo } from 'react'

interface AccountProgressMeterProps {
  currentBalance: number
  startingBalance: number
  targetProfit: number
  maxDrawdown: number
  dailyLossLimit: number
  currentDailyLoss: number
  accountType: 'evaluation' | 'funded'
}

export default function AccountProgressMeter({
  currentBalance,
  startingBalance,
  targetProfit,
  maxDrawdown,
  dailyLossLimit,
  currentDailyLoss,
  accountType
}: AccountProgressMeterProps) {
  
  const metrics = useMemo(() => {
    const totalPnL = currentBalance - startingBalance
    const profitProgress = Math.max(0, Math.min(100, (totalPnL / targetProfit) * 100))
    const drawdownUsed = Math.max(0, ((startingBalance - currentBalance) / maxDrawdown) * 100)
    const dailyLossUsed = Math.max(0, (currentDailyLoss / dailyLossLimit) * 100)
    
    const status = drawdownUsed >= 100 || dailyLossUsed >= 100 
      ? 'failed' 
      : profitProgress >= 100 
        ? 'passed' 
        : 'active'
    
    return {
      totalPnL,
      profitProgress,
      drawdownUsed,
      dailyLossUsed,
      status
    }
  }, [currentBalance, startingBalance, targetProfit, maxDrawdown, dailyLossLimit, currentDailyLoss])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'text-error-600 bg-error-50 border-error-200'
      case 'passed': return 'text-success-600 bg-success-50 border-success-200'
      default: return 'text-primary-600 bg-primary-50 border-primary-200'
    }
  }

  const ProgressBar = ({ 
    label, 
    percentage, 
    color, 
    showWarning = false,
    value,
    max
  }: { 
    label: string
    percentage: number
    color: string
    showWarning?: boolean
    value: number
    max: number
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-secondary-700">{label}</span>
        <span className={`text-sm font-semibold ${showWarning && percentage > 80 ? 'text-warning-600' : 'text-secondary-900'}`}>
          ${Math.abs(value).toLocaleString()} / ${max.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-secondary-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${color} ${
            showWarning && percentage > 80 ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-secondary-500">
        <span>0%</span>
        <span className={percentage > 80 && showWarning ? 'text-warning-600 font-medium' : ''}>
          {percentage.toFixed(1)}%
        </span>
        <span>100%</span>
      </div>
    </div>
  )

  return (
    <div className="card-premium">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Account Progress</h3>
          <p className="text-sm text-secondary-600 capitalize">{accountType} Challenge</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(metrics.status)}`}>
          {metrics.status === 'failed' ? '❌ Failed' : 
           metrics.status === 'passed' ? '✅ Passed' : 
           '🔄 Active'}
        </div>
      </div>

      {/* Current Balance & PnL */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-secondary-50 rounded-lg">
          <div className="text-2xl font-bold text-secondary-900">
            ${currentBalance.toLocaleString()}
          </div>
          <div className="text-sm text-secondary-600">Current Balance</div>
        </div>
        <div className="text-center p-4 bg-secondary-50 rounded-lg">
          <div className={`text-2xl font-bold ${
            metrics.totalPnL >= 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL.toLocaleString()}
          </div>
          <div className="text-sm text-secondary-600">Total P&L</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-6">
        {/* Profit Progress */}
        <ProgressBar
          label="Profit Target Progress"
          percentage={metrics.profitProgress}
          color="bg-gradient-to-r from-success-500 to-success-600"
          value={Math.max(0, metrics.totalPnL)}
          max={targetProfit}
        />

        {/* Drawdown Usage */}
        <ProgressBar
          label="Max Drawdown Used"
          percentage={metrics.drawdownUsed}
          color="bg-gradient-to-r from-warning-500 to-error-500"
          showWarning={true}
          value={Math.max(0, startingBalance - currentBalance)}
          max={maxDrawdown}
        />

        {/* Daily Loss Usage */}
        <ProgressBar
          label="Daily Loss Used"
          percentage={metrics.dailyLossUsed}
          color="bg-gradient-to-r from-warning-500 to-error-500"
          showWarning={true}
          value={currentDailyLoss}
          max={dailyLossLimit}
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {((currentBalance / startingBalance - 1) * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-secondary-600">Account Growth</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              ${(targetProfit - Math.max(0, metrics.totalPnL)).toLocaleString()}
            </div>
            <div className="text-xs text-secondary-600">To Target</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              ${(maxDrawdown - Math.max(0, startingBalance - currentBalance)).toLocaleString()}
            </div>
            <div className="text-xs text-secondary-600">DD Buffer</div>
          </div>
        </div>
      </div>
    </div>
  )
}