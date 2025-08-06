'use client'

import { useState, useEffect, useCallback } from 'react'
import LivePnLBar from './LivePnLBar'
import EnhancedTradesFeed from './EnhancedTradesFeed'
import TraderAlerts from './TraderAlerts'
import PositionSizeCalculator from './PositionSizeCalculator'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'
import EquityCurveChart from '@/components/dashboard/EquityCurveChart'

interface TradingDashboardProps {
  userId?: string
  accountData?: any
}

// Generate realistic trading data
const generateRealtimeData = () => {
  const startingBalance = 50000
  const currentBalance = 51300
  const dailyPnL = 850
  const sessionStartTime = new Date()
  sessionStartTime.setHours(8, 30, 0) // 8:30 AM
  
  return {
    startingBalance,
    currentBalance,
    dailyPnL,
    dailyLossLimit: 1000,
    maxDrawdown: 2500,
    violations: 0,
    consecutiveLosses: 1,
    drawdownPercent: 2.1,
    dailyTrades: 7,
    winStreak: 3,
    isMarketOpen: true,
    sessionStartTime
  }
}

const generateEquityData = () => {
  const data = []
  const baseEquity = 50000
  let currentEquity = baseEquity
  
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.45) * 200 // Slight upward bias
    currentEquity += change
    data.push({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      equity: Math.round(currentEquity),
      trade: i % 3 === 0 ? {
        symbol: ['ES', 'NQ', 'YM'][Math.floor(Math.random() * 3)],
        pnl: change,
        side: Math.random() > 0.5 ? 'buy' as const : 'sell' as const
      } : undefined
    })
  }
  
  return data
}

export default function TradingDashboard({ userId, accountData }: TradingDashboardProps) {
  const [tradingData, setTradingData] = useState(generateRealtimeData())
  const [isPaused, setIsPaused] = useState(false)
  const [emergencyStop, setEmergencyStop] = useState(false)
  const [selectedChart, setSelectedChart] = useState<'equity' | 'daily' | 'performance'>('equity')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [equityData] = useState(generateEquityData())

  // Simulate real-time updates
  useEffect(() => {
    if (isPaused || emergencyStop) return

    const interval = setInterval(() => {
      setTradingData(prev => ({
        ...prev,
        currentBalance: prev.currentBalance + (Math.random() - 0.5) * 10,
        dailyPnL: prev.dailyPnL + (Math.random() - 0.5) * 5,
        dailyTrades: prev.dailyTrades + (Math.random() > 0.95 ? 1 : 0)
      }))
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isPaused, emergencyStop])

  const handlePauseTrading = useCallback(() => {
    setIsPaused(!isPaused)
  }, [isPaused])

  const handleEmergencyStop = useCallback(() => {
    setEmergencyStop(true)
    setIsPaused(true)
  }, [])

  const handleTradeSelect = useCallback((trade: any) => {
    console.log('Selected trade:', trade)
    // Could open trade details modal, update charts, etc.
  }, [])

  // Quick action shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key.toLowerCase()) {
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setEmergencyStop(false)
            setIsPaused(false)
          }
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setSelectedChart(prev => 
              prev === 'equity' ? 'daily' : 
              prev === 'daily' ? 'performance' : 'equity'
            )
          }
          break
        case '?':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setShowShortcuts(!showShortcuts)
          }
          break
        case 'f11':
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            document.documentElement.requestFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showShortcuts])

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Live P&L Bar - Always visible at top */}
      <LivePnLBar
        currentBalance={tradingData.currentBalance}
        startingBalance={tradingData.startingBalance}
        dailyPnL={tradingData.dailyPnL}
        dailyLossLimit={tradingData.dailyLossLimit}
        maxDrawdown={tradingData.maxDrawdown}
        violations={tradingData.violations}
        isMarketOpen={tradingData.isMarketOpen}
        sessionStartTime={tradingData.sessionStartTime}
        onPauseTrading={handlePauseTrading}
        onEmergencyStop={handleEmergencyStop}
      />

      {/* Emergency Stop Overlay */}
      {emergencyStop && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-95 z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4 animate-pulse">
              EMERGENCY STOP ACTIVATED
            </div>
            <div className="text-xl text-red-200 mb-8">
              All trading activities have been paused
            </div>
            <button
              onClick={() => {
                setEmergencyStop(false)
                setIsPaused(false)
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-bold"
            >
              RESUME TRADING (Ctrl+R)
            </button>
          </div>
        </div>
      )}

      {/* Main Trading Interface */}
      <div className="flex h-full" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left: Enhanced Trades Feed */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          <EnhancedTradesFeed
            trades={[]}
            onTradeSelect={handleTradeSelect}
            className="flex-1"
          />
          
          {/* Quick Actions Panel */}
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="text-xs font-bold text-gray-300 mb-2">QUICK ACTIONS</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-bold">
                NEW ORDER
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-xs font-bold">
                CLOSE ALL
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-xs font-bold">
                FLATTEN
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs font-bold">
                BRACKET
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-400">
              Ctrl+N: New Order • Ctrl+F: Flatten All
            </div>
          </div>
        </div>

        {/* Center: Charts and Analysis */}
        <div className="flex-1 flex flex-col">
          {/* Chart selector */}
          <div className="p-3 border-b border-gray-700 bg-gray-800">
            <div className="flex space-x-2">
              {(['equity', 'daily', 'performance'] as const).map(chart => (
                <button
                  key={chart}
                  onClick={() => setSelectedChart(chart)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    selectedChart === chart 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {chart}
                </button>
              ))}
              <div className="flex-1 text-right text-xs text-gray-400">
                Ctrl+D to cycle charts
              </div>
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1 p-4 bg-gray-900">
            {selectedChart === 'equity' && (
              <div className="h-full bg-gray-800 rounded border border-gray-700 p-4">
                <EquityCurveChart
                  equityData={equityData}
                  startingBalance={tradingData.startingBalance}
                  targetProfit={5000}
                  maxDrawdown={tradingData.maxDrawdown}
                />
              </div>
            )}
            
            {selectedChart === 'daily' && (
              <div className="h-full bg-gray-800 rounded border border-gray-700 p-4 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">📊</div>
                  <div>Daily Performance Chart</div>
                  <div className="text-sm">Coming soon...</div>
                </div>
              </div>
            )}
            
            {selectedChart === 'performance' && (
              <div className="h-full bg-gray-800 rounded border border-gray-700 p-4">
                {/* Performance metrics grid */}
                <div className="grid grid-cols-4 gap-4 h-full">
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">WIN RATE</div>
                    <div className="text-2xl font-bold text-green-400">73.2%</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">PROFIT FACTOR</div>
                    <div className="text-2xl font-bold text-blue-400">1.84</div>
                    <div className="text-xs text-gray-500">Gross P/L ratio</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">AVG R-MULTIPLE</div>
                    <div className="text-2xl font-bold text-purple-400">1.2R</div>
                    <div className="text-xs text-gray-500">Risk-adjusted</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">MAX DD</div>
                    <div className="text-2xl font-bold text-orange-400">4.2%</div>
                    <div className="text-xs text-gray-500">${(tradingData.currentBalance * 0.042).toFixed(0)} max loss</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk & Compliance Status Bar */}
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">RULES: COMPLIANT</span>
                </div>
                <div className="text-gray-400">
                  Daily Loss: {((Math.abs(Math.min(0, tradingData.dailyPnL)) / tradingData.dailyLossLimit) * 100).toFixed(0)}%
                </div>
                <div className="text-gray-400">
                  Drawdown: {tradingData.drawdownPercent.toFixed(1)}%
                </div>
                <div className="text-gray-400">
                  Trades: {tradingData.dailyTrades}/15 daily
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {isPaused ? 'TRADING PAUSED' : 'LIVE TRADING'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Alerts, Position Calculator and Market Data */}
        <div className="w-80 border-l border-gray-700 flex flex-col">
          <TraderAlerts
            currentData={{
              dailyPnL: tradingData.dailyPnL,
              consecutiveLosses: tradingData.consecutiveLosses,
              drawdownPercent: tradingData.drawdownPercent,
              accountBalance: tradingData.currentBalance,
              dailyTrades: tradingData.dailyTrades,
              dailyLossLimit: tradingData.dailyLossLimit
            }}
            className="flex-shrink-0"
          />
          
          {/* Position Size Calculator */}
          <div className="border-t border-gray-700">
            <PositionSizeCalculator
              accountBalance={tradingData.currentBalance}
              className="border-0 rounded-none"
            />
          </div>
          
          {/* Market Status */}
          <div className="p-3 border-t border-gray-700 bg-gray-800 flex-shrink-0">
            <div className="text-xs font-bold text-gray-300 mb-2">MARKET STATUS</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">ES Future:</span>
                <span className="text-green-400">4751.25 ↗</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NQ Future:</span>
                <span className="text-red-400">16890.50 ↘</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VIX:</span>
                <span className="text-yellow-400">18.52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volume:</span>
                <span className="text-blue-400">Heavy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}