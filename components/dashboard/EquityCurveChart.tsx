'use client'

import { useMemo } from 'react'

interface EquityPoint {
  timestamp: Date
  equity: number
  trade?: {
    symbol: string
    pnl: number
    side: 'buy' | 'sell'
  }
}

interface EquityCurveChartProps {
  equityData: EquityPoint[]
  startingBalance: number
  targetProfit: number
  maxDrawdown: number
  className?: string
}

export default function EquityCurveChart({
  equityData,
  startingBalance,
  targetProfit,
  maxDrawdown,
  className = ''
}: EquityCurveChartProps) {
  
  const chartData = useMemo(() => {
    if (equityData.length === 0) return null
    
    const minEquity = Math.min(...equityData.map(d => d.equity))
    const maxEquity = Math.max(...equityData.map(d => d.equity))
    const targetLine = startingBalance + targetProfit
    const maxDrawdownLine = startingBalance - maxDrawdown
    
    // Calculate chart bounds with padding
    const chartMin = Math.min(minEquity, maxDrawdownLine) * 0.98
    const chartMax = Math.max(maxEquity, targetLine) * 1.02
    const range = chartMax - chartMin
    
    // Convert equity points to SVG coordinates
    const svgPoints = equityData.map((point, index) => ({
      x: (index / (equityData.length - 1)) * 100, // 0-100%
      y: ((chartMax - point.equity) / range) * 100, // 0-100% (inverted)
      ...point
    }))
    
    // Helper lines
    const targetY = ((chartMax - targetLine) / range) * 100
    const drawdownY = ((chartMax - maxDrawdownLine) / range) * 100
    const startingY = ((chartMax - startingBalance) / range) * 100
    
    return {
      svgPoints,
      targetY,
      drawdownY,
      startingY,
      chartMin,
      chartMax,
      currentEquity: equityData[equityData.length - 1]?.equity || startingBalance,
      totalReturn: ((equityData[equityData.length - 1]?.equity || startingBalance) - startingBalance)
    }
  }, [equityData, startingBalance, targetProfit, maxDrawdown])

  if (!chartData || equityData.length === 0) {
    return (
      <div className={`card ${className}`}>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equity Curve</h3>
        <div className="h-64 flex items-center justify-center text-secondary-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <div>No trading data yet</div>
            <div className="text-sm">Your equity curve will appear after your first trade</div>
          </div>
        </div>
      </div>
    )
  }

  const { svgPoints, targetY, drawdownY, startingY, currentEquity, totalReturn } = chartData

  // Create SVG path
  const pathD = svgPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')

  // Create area path (for gradient fill)
  const areaPathD = pathD + ` L 100 100 L 0 100 Z`

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Equity Curve</h3>
          <p className="text-sm text-secondary-600">Real-time account equity tracking</p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${totalReturn >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
          </div>
          <div className="text-sm text-secondary-600">
            {((totalReturn / startingBalance) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 bg-secondary-50 rounded-lg p-4 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={totalReturn >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={totalReturn >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Target profit line */}
          <line
            x1="0"
            y1={targetY}
            x2="100"
            y2={targetY}
            stroke="#22c55e"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.7"
          />
          
          {/* Max drawdown line */}
          <line
            x1="0"
            y1={drawdownY}
            x2="100"
            y2={drawdownY}
            stroke="#ef4444"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.7"
          />
          
          {/* Starting balance line */}
          <line
            x1="0"
            y1={startingY}
            x2="100"
            y2={startingY}
            stroke="#64748b"
            strokeWidth="0.3"
            opacity="0.5"
          />
          
          {/* Area fill */}
          <path
            d={areaPathD}
            fill="url(#equityGradient)"
          />
          
          {/* Main equity line */}
          <path
            d={pathD}
            fill="none"
            stroke={totalReturn >= 0 ? "#22c55e" : "#ef4444"}
            strokeWidth="1"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {svgPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="0.8"
              fill={point.trade?.pnl && point.trade.pnl >= 0 ? "#22c55e" : "#ef4444"}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          ))}
        </svg>
        
        {/* Chart labels */}
        <div className="absolute top-2 left-4 space-y-1">
          <div className="flex items-center text-xs text-success-600">
            <div className="w-3 h-px bg-success-500 mr-2 opacity-70"></div>
            Target: ${(startingBalance + targetProfit).toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-error-600">
            <div className="w-3 h-px bg-error-500 mr-2 opacity-70"></div>
            Max DD: ${(startingBalance - maxDrawdown).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-secondary-900">
            ${currentEquity.toLocaleString()}
          </div>
          <div className="text-xs text-secondary-600">Current Equity</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-secondary-900">
            {equityData.length}
          </div>
          <div className="text-xs text-secondary-600">Data Points</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-semibold ${totalReturn >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            {((totalReturn / startingBalance) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-secondary-600">Total Return</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-secondary-900">
            {equityData.filter(d => d.trade?.pnl && d.trade.pnl > 0).length}W/{equityData.filter(d => d.trade?.pnl && d.trade.pnl < 0).length}L
          </div>
          <div className="text-xs text-secondary-600">Win/Loss</div>
        </div>
      </div>

      {/* Last Trade Info */}
      {equityData.length > 0 && equityData[equityData.length - 1]?.trade && (
        <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-secondary-600">Last Trade:</div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {equityData[equityData.length - 1].trade!.symbol}
              </span>
              <span className={`text-sm font-semibold ${
                equityData[equityData.length - 1].trade!.pnl >= 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {equityData[equityData.length - 1].trade!.pnl >= 0 ? '+' : ''}
                ${equityData[equityData.length - 1].trade!.pnl.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}