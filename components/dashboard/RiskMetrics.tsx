'use client'

export default function RiskMetrics() {
  const riskMetrics = [
    {
      label: 'Risk Score',
      value: 32,
      max: 100,
      status: 'low',
      description: 'Low risk profile'
    },
    {
      label: 'Drawdown',
      value: 2.4,
      max: 10,
      status: 'good',
      description: 'Within limits'
    },
    {
      label: 'Volatility',
      value: 18.5,
      max: 25,
      status: 'moderate',
      description: 'Moderate volatility'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
      case 'good':
        return 'text-success-600 bg-success-100'
      case 'moderate':
        return 'text-warning-600 bg-warning-100'
      case 'high':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-secondary-600 bg-secondary-100'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'low':
      case 'good':
        return 'bg-success-500'
      case 'moderate':
        return 'bg-warning-500'
      case 'high':
        return 'bg-error-500'
      default:
        return 'bg-secondary-500'
    }
  }

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-sm text-secondary-900">Risk Metrics</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-secondary-600">Live</span>
        </div>
      </div>

      <div className="space-y-6">
        {riskMetrics.map((metric, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-secondary-900">{metric.label}</div>
                <div className="text-sm text-secondary-600">{metric.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-secondary-900">
                  {metric.value}
                  {metric.label === 'Risk Score' ? '/100' : '%'}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metric.status)}`}
                style={{ width: `${(metric.value / metric.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Risk Summary */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-primary-50 rounded-xl border border-success-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-secondary-900">Risk Status: Good</div>
              <div className="text-sm text-secondary-600">All metrics within acceptable ranges</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}