'use client'

import { useState, useMemo } from 'react'

interface DailyData {
  date: Date
  pnl: number
  trades: number
  wins: number
  losses: number
  volume: number
  bestTrade: number
  worstTrade: number
}

interface DailyBreakdownProps {
  dailyData: DailyData[]
  className?: string
}

export default function DailyBreakdown({ dailyData, className = '' }: DailyBreakdownProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const { monthData, monthStats } = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    // Filter data for current month
    const monthlyData = dailyData.filter(d => 
      d.date.getMonth() === month && d.date.getFullYear() === year
    )
    
    // Create calendar grid
    const calendarDays = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthlyData.find(d => d.date.getDate() === day)
      calendarDays.push({
        day,
        data: dayData || null,
        isToday: new Date().toDateString() === new Date(year, month, day).toDateString()
      })
    }
    
    // Calculate month statistics
    const totalPnL = monthlyData.reduce((sum, d) => sum + d.pnl, 0)
    const totalTrades = monthlyData.reduce((sum, d) => sum + d.trades, 0)
    const totalWins = monthlyData.reduce((sum, d) => sum + d.wins, 0)
    const totalLosses = monthlyData.reduce((sum, d) => sum + d.losses, 0)
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0
    const profitableDays = monthlyData.filter(d => d.pnl > 0).length
    const losingDays = monthlyData.filter(d => d.pnl < 0).length
    const breakEvenDays = monthlyData.filter(d => d.pnl === 0 && d.trades > 0).length
    const tradingDays = monthlyData.filter(d => d.trades > 0).length
    
    return {
      monthData: calendarDays,
      monthStats: {
        totalPnL,
        totalTrades,
        winRate,
        profitableDays,
        losingDays,
        breakEvenDays,
        tradingDays,
        avgDailyPnL: tradingDays > 0 ? totalPnL / tradingDays : 0
      }
    }
  }, [dailyData, currentMonth])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDayColor = (pnl: number, trades: number) => {
    if (trades === 0) return 'bg-secondary-100 text-secondary-400'
    if (pnl > 0) return 'bg-success-100 text-success-800 border-success-200'
    if (pnl < 0) return 'bg-error-100 text-error-800 border-error-200'
    return 'bg-warning-100 text-warning-800 border-warning-200'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const CalendarView = () => (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-secondary-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {monthData.map((dayInfo, index) => (
          <div key={index} className="aspect-square">
            {dayInfo ? (
              <div className={`h-full border rounded-lg p-1 text-xs ${
                dayInfo.isToday ? 'ring-2 ring-primary-500' : ''
              } ${
                dayInfo.data 
                  ? getDayColor(dayInfo.data.pnl, dayInfo.data.trades)
                  : 'bg-white border-secondary-200 text-secondary-600'
              }`}>
                <div className="font-semibold">{dayInfo.day}</div>
                {dayInfo.data && (
                  <div className="mt-1 space-y-0.5">
                    <div className="font-medium">
                      {formatCurrency(dayInfo.data.pnl)}
                    </div>
                    <div className="opacity-75">
                      {dayInfo.data.trades} trades
                    </div>
                    <div className="opacity-75">
                      {dayInfo.data.wins}W/{dayInfo.data.losses}L
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const ListView = () => {
    const monthlyData = dailyData.filter(d => 
      d.date.getMonth() === currentMonth.getMonth() && 
      d.date.getFullYear() === currentMonth.getFullYear()
    ).sort((a, b) => b.date.getTime() - a.date.getTime())

    return (
      <div className="space-y-2">
        {monthlyData.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <div className="text-4xl mb-2">📅</div>
            <div>No trading data for this month</div>
          </div>
        ) : (
          monthlyData.map((day, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              day.pnl >= 0 ? 'bg-success-50 border-success-200' : 'bg-error-50 border-error-200'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-secondary-900">
                    {day.date.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-secondary-600 mt-1">
                    {day.trades} trades • {day.wins}W/{day.losses}L
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    day.pnl >= 0 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {day.pnl >= 0 ? '+' : ''}{formatCurrency(day.pnl)}
                  </div>
                  <div className="text-sm text-secondary-600">
                    Best: {formatCurrency(day.bestTrade)} • Worst: {formatCurrency(day.worstTrade)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Daily Breakdown</h3>
          <p className="text-sm text-secondary-600">Daily trading performance analysis</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'calendar' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'list' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          ←
        </button>
        
        <h2 className="text-xl font-semibold text-secondary-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Month Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
        <div className="text-center">
          <div className={`text-lg font-bold ${
            monthStats.totalPnL >= 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {formatCurrency(monthStats.totalPnL)}
          </div>
          <div className="text-xs text-secondary-600">Total P&L</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-secondary-900">
            {monthStats.totalTrades}
          </div>
          <div className="text-xs text-secondary-600">Total Trades</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-secondary-900">
            {monthStats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-secondary-600">Win Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-secondary-900">
            {monthStats.tradingDays}
          </div>
          <div className="text-xs text-secondary-600">Trading Days</div>
        </div>
      </div>

      {/* Daily Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="text-center p-3 bg-success-50 rounded-lg">
          <div className="text-lg font-semibold text-success-600">
            {monthStats.profitableDays}
          </div>
          <div className="text-success-700">Profitable Days</div>
        </div>
        
        <div className="text-center p-3 bg-error-50 rounded-lg">
          <div className="text-lg font-semibold text-error-600">
            {monthStats.losingDays}
          </div>
          <div className="text-error-700">Losing Days</div>
        </div>
        
        <div className="text-center p-3 bg-secondary-50 rounded-lg">
          <div className="text-lg font-semibold text-secondary-600">
            {monthStats.breakEvenDays}
          </div>
          <div className="text-secondary-700">Break Even</div>
        </div>
      </div>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? <CalendarView /> : <ListView />}
    </div>
  )
}