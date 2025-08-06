export default function TrustSection() {
  const platforms = [
    { name: "TradingView", width: "w-40", available: true, featured: true },
    { name: "NinjaTrader", width: "w-32", available: false },
    { name: "rTrader", width: "w-28", available: false },
    { name: "Tradovate", width: "w-32", available: false }
  ]

  return (
    <section className="py-16 bg-white border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-secondary-500 uppercase tracking-wider mb-4">
            Platform Integrations
          </p>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            <span className="text-primary-600">TradingView</span> Integration Ready Now
          </h3>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Start protecting your account today with our complete TradingView integration. Connect your alerts in under 5 minutes and get real-time compliance monitoring for every trade.
          </p>
        </div>
        
        <div className="relative pt-6 pb-4">
          <div className="flex items-center justify-center space-x-6 md:space-x-10">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className={`${platform.width} h-14 rounded-lg flex items-center justify-center relative transition-all duration-300 ${
                  platform.available 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 border-2 border-primary-400' 
                    : 'bg-secondary-100 text-secondary-400 hover:bg-secondary-200'
                }`}
              >
                <span className={`text-sm font-medium text-center px-3 ${platform.featured ? 'font-bold text-lg' : ''}`}>
                  {platform.name}
                </span>
                {platform.featured && (
                  <>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-success-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold shadow-lg">
                      LIVE NOW
                    </div>
                  </>
                )}
                {!platform.available && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-sm text-secondary-600">Active Traders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">$2.1B+</div>
            <div className="text-sm text-secondary-600">Volume Monitored</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
            <div className="text-sm text-secondary-600">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-sm text-secondary-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}