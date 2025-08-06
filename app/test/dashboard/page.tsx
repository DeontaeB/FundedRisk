import RealTimeTradesFeed from '@/components/dashboard/RealTimeTradesFeed'
import RealTimeAlerts from '@/components/dashboard/RealTimeAlerts'

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Dashboard Test</h1>
          <p className="text-gray-600">Testing WebSocket integration with dashboard components</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <RealTimeTradesFeed maxTrades={8} />
          </div>
          <div>
            <RealTimeAlerts maxAlerts={6} />
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Trade Tests</h4>
              <button
                onClick={async () => {
                  const response = await fetch('/api/test/websocket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'trade',
                      userId: 'test-user', // Replace with actual user ID
                      data: {
                        symbol: 'ES',
                        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                        quantity: Math.floor(Math.random() * 5) + 1,
                        price: 4500 + (Math.random() - 0.5) * 50,
                        pnl: (Math.random() - 0.5) * 500
                      }
                    })
                  })
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Send Random Trade
              </button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Alert Tests</h4>
              <button
                onClick={async () => {
                  const alerts = [
                    {
                      title: 'Daily Loss Limit Warning',
                      message: 'Approaching daily loss limit',
                      severity: 'warning',
                      currentValue: 850,
                      limit: 1000
                    },
                    {
                      title: 'Position Size Violation',
                      message: 'Position size exceeds maximum allowed',
                      severity: 'high',
                      currentValue: 15,
                      limit: 10
                    },
                    {
                      title: 'Drawdown Alert',
                      message: 'Account drawdown exceeds threshold',
                      severity: 'medium',
                      currentValue: 8.5,
                      limit: 10
                    }
                  ]
                  
                  const randomAlert = alerts[Math.floor(Math.random() * alerts.length)]
                  
                  await fetch('/api/test/websocket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'compliance',
                      userId: 'test-user', // Replace with actual user ID
                      data: randomAlert
                    })
                  })
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Send Random Alert
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure the WebSocket server is running on port 3001. 
              Replace 'test-user' with actual user IDs when testing with authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}