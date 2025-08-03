'use client'

import { useEffect, useState } from 'react'

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: string
  pnl: number
  status: 'open' | 'closed'
}

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    // Mock trades data
    setTrades([
      {
        id: '1',
        symbol: 'ES',
        side: 'buy',
        quantity: 2,
        price: 4750.25,
        timestamp: new Date().toISOString(),
        pnl: 125.50,
        status: 'closed',
      },
      {
        id: '2',
        symbol: 'NQ',
        side: 'sell',
        quantity: 1,
        price: 16890.75,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        pnl: -45.25,
        status: 'closed',
      },
      {
        id: '3',
        symbol: 'ES',
        side: 'buy',
        quantity: 1,
        price: 4748.50,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        pnl: 0,
        status: 'open',
      },
    ])
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'text-green-600' : 'text-red-600'
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600'
    if (pnl < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Trades</h3>
        <span className="text-sm text-gray-500">Last 24 hours</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade.symbol}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getSideColor(trade.side)}`}>
                  {trade.side.toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${trade.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(trade.timestamp)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnLColor(trade.pnl)}`}>
                  {trade.pnl === 0 ? '-' : `$${trade.pnl.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    trade.status === 'open' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}