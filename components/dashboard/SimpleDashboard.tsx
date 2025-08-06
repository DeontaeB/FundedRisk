'use client'

import { useState } from 'react'

export default function SimpleDashboard() {
  const [currentBalance] = useState(51300)
  const [startingBalance] = useState(50000)
  const [dailyPnL] = useState(850)
  const [dailyLossLimit] = useState(1000)
  
  const totalPnL = currentBalance - startingBalance
  const dailyLossUsed = Math.abs(Math.min(0, dailyPnL))
  const dailyLossRemaining = dailyLossLimit - dailyLossUsed
  
  const getRiskColor = () => {
    const lossPercent = (dailyLossUsed / dailyLossLimit) * 100
    if (lossPercent >= 80) return 'text-red-600 bg-red-50'
    if (lossPercent >= 60) return 'text-orange-600 bg-orange-50'  
    if (lossPercent >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Status Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div>
              <div className="text-sm text-gray-500">Account Balance</div>
              <div className="text-2xl font-bold text-gray-900">
                ${currentBalance.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Daily P&L</div>
              <div className={`text-2xl font-bold ${dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dailyPnL >= 0 ? '+' : ''}${dailyPnL}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Daily Loss Remaining</div>
              <div className={`text-2xl font-bold ${getRiskColor()}`}>
                ${dailyLossRemaining}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">All Rules OK</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Account Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Progress</h2>
              
              <div className="space-y-6">
                {/* Profit Target */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Profit Target Progress</span>
                    <span>{Math.round((totalPnL / 5000) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (totalPnL / 5000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span className="font-medium">${totalPnL} / $5,000</span>
                  </div>
                </div>

                {/* Daily Loss Limit */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Daily Loss Used</span>
                    <span>{Math.round((dailyLossUsed / dailyLossLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        dailyLossUsed / dailyLossLimit >= 0.8 ? 'bg-red-500' :
                        dailyLossUsed / dailyLossLimit >= 0.6 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(dailyLossUsed / dailyLossLimit) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span className="font-medium">${dailyLossUsed} / $1,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold text-gray-900">73%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Trades Today</span>
                  <span className="font-semibold text-gray-900">7</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Win</span>
                  <span className="font-semibold text-green-600">+$145</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Loss</span>
                  <span className="font-semibold text-red-600">-$89</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Trade</span>
                  <span className="font-semibold text-green-600">+$285</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">✓</div>
                <div className="text-gray-600">No alerts</div>
                <div className="text-sm text-gray-500">All rules are being followed</div>
              </div>
            </div>

            {/* Webhook Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Status</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Connected</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View URL
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Last trade received: 2 minutes ago
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Trades</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Side</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-900">14:32</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">ES</td>
                    <td className="py-3 px-4 text-sm text-blue-600">BUY</td>
                    <td className="py-3 px-4 text-sm text-gray-900">2</td>
                    <td className="py-3 px-4 text-sm text-gray-900">4751.25</td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">+$125</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-900">14:18</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">NQ</td>
                    <td className="py-3 px-4 text-sm text-orange-600">SELL</td>
                    <td className="py-3 px-4 text-sm text-gray-900">1</td>
                    <td className="py-3 px-4 text-sm text-gray-900">16890.50</td>
                    <td className="py-3 px-4 text-sm font-medium text-red-600">-$45</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-900">13:55</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">ES</td>
                    <td className="py-3 px-4 text-sm text-blue-600">BUY</td>
                    <td className="py-3 px-4 text-sm text-gray-900">1</td>
                    <td className="py-3 px-4 text-sm text-gray-900">4748.75</td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">+$87</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}