'use client'

import { useState } from 'react'

export default function PerformanceChart() {
  const [timeframe, setTimeframe] = useState('1D')

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

  // Mock data - in real app, this would come from your API
  const performanceData = {
    currentValue: 125847.50,
    change: 2847.25,
    changePercent: 2.31,
    chartData: [
      // Mock chart points
      { time: '09:30', value: 123000 },
      { time: '10:00', value: 123500 },
      { time: '10:30', value: 124200 },
      { time: '11:00', value: 123800 },
      { time: '11:30', value: 124500 },
      { time: '12:00', value: 125100 },
      { time: '12:30', value: 124800 },
      { time: '13:00', value: 125400 },
      { time: '13:30', value: 125847 },
    ]
  }

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="heading-sm text-secondary-900 mb-2">Portfolio Performance</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-secondary-900">
              ${performanceData.currentValue.toLocaleString()}
            </span>
            <div className={`flex items-center space-x-1 ${
              performanceData.change >= 0 ? 'text-success-600' : 'text-error-600'
            }`}>
              <svg className={`w-4 h-4 ${performanceData.change >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">
                ${Math.abs(performanceData.change).toLocaleString()} ({Math.abs(performanceData.changePercent)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-secondary-100 rounded-xl p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 bg-gradient-to-br from-primary-50/50 to-accent-50/50 rounded-xl p-6 border border-primary-100/50">
        {/* Mock Chart */}
        <div className="relative h-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-secondary-500">
            <span>$126k</span>
            <span>$125k</span>
            <span>$124k</span>
            <span>$123k</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-secondary-200/50"
                  style={{ top: `${i * 25}%` }}
                />
              ))}
            </div>

            {/* Mock line chart */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.1 }} />
                </linearGradient>
              </defs>
              
              {/* Area under curve */}
              <path
                d="M 0 180 L 50 160 L 100 140 L 150 150 L 200 130 L 250 120 L 300 125 L 350 110 L 400 100 L 400 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Main line */}
              <path
                d="M 0 180 L 50 160 L 100 140 L 150 150 L 200 130 L 250 120 L 300 125 L 350 110 L 400 100"
                stroke="#0ea5e9"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />
              
              {/* Data points */}
              {performanceData.chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={index * 50}
                  cy={180 - (point.value - 123000) / 100}
                  r="4"
                  fill="#0ea5e9"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              ))}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-secondary-500 mt-2">
            <span>09:30</span>
            <span>11:00</span>
            <span>12:30</span>
            <span>14:00</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-secondary-200">
        <div className="text-center">
          <div className="text-sm text-secondary-600 mb-1">Today's High</div>
          <div className="text-lg font-semibold text-secondary-900">$125,847</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-secondary-600 mb-1">Today's Low</div>
          <div className="text-lg font-semibold text-secondary-900">$123,000</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-secondary-600 mb-1">Volume</div>
          <div className="text-lg font-semibold text-secondary-900">47 trades</div>
        </div>
      </div>
    </div>
  )
}