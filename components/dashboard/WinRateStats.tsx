'use client'

import { useMemo } from 'react'

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  pnl: number
  quantity: number
  entryPrice: number
  exitPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskAmount: number
  timestamp: Date
}

interface WinRateStatsProps {
  trades: Trade[]
  className?: string
}

export default function WinRateStats({ trades, className = '' }: WinRateStatsProps) {
  
  const stats = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        avgRR: 0,
        profitFactor: 0,
        totalProfit: 0,
        totalLoss: 0,
        expectancy: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0,
        bestTrade: null as Trade | null,
        worstTrade: null as Trade | null
      }
    }

    const closedTrades = trades.filter(t => t.exitPrice && t.pnl !== 0)
    const winningTrades = closedTrades.filter(t => t.pnl > 0)
    const losingTrades = closedTrades.filter(t => t.pnl < 0)
    
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
    
    const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0
    
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
    
    // Calculate average Risk-to-Reward
    const rrTrades = closedTrades.filter(t => t.riskAmount > 0)
    const avgRR = rrTrades.length > 0 
      ? rrTrades.reduce((sum, t) => sum + (t.pnl / t.riskAmount), 0) / rrTrades.length 
      : 0

    // Calculate expectancy
    const expectancy = closedTrades.length > 0 
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0

    // Find consecutive streaks
    let currentConsecutiveWins = 0
    let currentConsecutiveLosses = 0
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0

    closedTrades.forEach(trade => {
      if (trade.pnl > 0) {
        currentConsecutiveWins++
        currentConsecutiveLosses = 0
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins)
      } else {
        currentConsecutiveLosses++
        currentConsecutiveWins = 0
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses)
      }
    })

    const bestTrade = closedTrades.reduce((best, trade) => 
      !best || trade.pnl > best.pnl ? trade : best, null as Trade | null)
    
    const worstTrade = closedTrades.reduce((worst, trade) => 
      !worst || trade.pnl < worst.pnl ? trade : worst, null as Trade | null)

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      avgWin,
      avgLoss,
      avgRR,
      profitFactor,
      totalProfit,
      totalLoss,
      expectancy,
      consecutiveWins: currentConsecutiveWins,
      consecutiveLosses: currentConsecutiveLosses,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      bestTrade,
      worstTrade
    }
  }, [trades])

  const getWinRateColor = (rate: number) => {
    if (rate >= 60) return 'text-success-600 bg-success-50'
    if (rate >= 40) return 'text-warning-600 bg-warning-50'
    return 'text-error-600 bg-error-50'
  }

  const getRRColor = (rr: number) => {
    if (rr >= 1.5) return 'text-success-600'
    if (rr >= 1) return 'text-warning-600'
    return 'text-error-600'
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Performance Stats</h3>
          <p className="text-sm text-secondary-600">Win rate & risk-to-reward analysis</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-secondary-900">{stats.totalTrades}</div>
          <div className="text-sm text-secondary-600">Total Trades</div>
        </div>
      </div>

      {stats.totalTrades === 0 ? (
        <div className="text-center py-8 text-secondary-500">
          <div className="text-4xl mb-2">📊</div>
          <div>No completed trades</div>
          <div className="text-sm">Stats will appear after closing positions</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Win Rate */}
            <div className={`p-4 rounded-lg ${getWinRateColor(stats.winRate)}`}>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm opacity-80">Win Rate</div>
                <div className="text-xs opacity-60 mt-1">
                  {stats.winningTrades}W / {stats.losingTrades}L
                </div>
              </div>
            </div>

            {/* Average RR */}
            <div className="p-4 rounded-lg bg-secondary-50">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRRColor(stats.avgRR)}`}>
                  {stats.avgRR.toFixed(2)}:1
                </div>
                <div className="text-sm text-secondary-700">Avg Risk:Reward</div>
                <div className="text-xs text-secondary-500 mt-1">
                  Per trade ratio
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className="font-semibold text-success-600">
                ${stats.avgWin.toLocaleString()}
              </div>
              <div className="text-secondary-600">Avg Win</div>
            </div>
            
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className="font-semibold text-error-600">
                ${stats.avgLoss.toLocaleString()}
              </div>
              <div className="text-secondary-600">Avg Loss</div>
            </div>
            
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className="font-semibold text-secondary-900">
                {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
              </div>
              <div className="text-secondary-600">Profit Factor</div>
            </div>
            
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className={`font-semibold ${stats.expectancy >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                ${stats.expectancy.toFixed(0)}
              </div>
              <div className="text-secondary-600">Expectancy</div>
            </div>
          </div>

          {/* Streaks */}
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-secondary-600 mb-2">Current Streak</div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-success-600">
                      {stats.consecutiveWins}
                    </div>
                    <div className="text-xs text-secondary-600">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-error-600">
                      {stats.consecutiveLosses}
                    </div>
                    <div className="text-xs text-secondary-600">Losses</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-secondary-600 mb-2">Max Streak</div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-success-600">
                      {stats.maxConsecutiveWins}
                    </div>
                    <div className="text-xs text-secondary-600">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-error-600">
                      {stats.maxConsecutiveLosses}
                    </div>
                    <div className="text-xs text-secondary-600">Losses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best/Worst Trade */}
          {(stats.bestTrade || stats.worstTrade) && (
            <div className="border-t border-secondary-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {stats.bestTrade && (
                  <div className="p-3 bg-success-50 rounded-lg">
                    <div className="text-success-700 font-medium mb-1">Best Trade</div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">{stats.bestTrade.symbol}</span>
                      <span className="font-semibold text-success-600">
                        +${stats.bestTrade.pnl.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                
                {stats.worstTrade && (
                  <div className="p-3 bg-error-50 rounded-lg">
                    <div className="text-error-700 font-medium mb-1">Worst Trade</div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">{stats.worstTrade.symbol}</span>
                      <span className="font-semibold text-error-600">
                        ${stats.worstTrade.pnl.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}