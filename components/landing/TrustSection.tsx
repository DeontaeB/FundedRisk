export default function TrustSection() {
  const platforms = [
    { name: "TradingView", width: "w-32", available: true, featured: true },
    { name: "MetaTrader", width: "w-28", available: false },
    { name: "NinjaTrader", width: "w-36", available: false },
    { name: "ThinkorSwim", width: "w-32", available: false },
    { name: "Sierra Chart", width: "w-28", available: false },
    { name: "CQG", width: "w-20", available: false }
  ]

  return (
    <section className="py-16 bg-white border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-secondary-500 uppercase tracking-wider mb-4">
            Platform Integrations
          </p>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            Start with TradingView, More Coming Soon
          </h3>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            We're launching with full TradingView integration. Additional platforms will be added based on user demand.
          </p>
        </div>
        
        <div className="relative pt-4 pb-4">
          <div className="flex items-center justify-center space-x-8 md:space-x-12">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className={`${platform.width} h-12 rounded-lg flex items-center justify-center relative transition-all duration-300 ${
                  platform.available 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'bg-secondary-200 text-secondary-500'
                }`}
              >
                <span className={`text-xs font-medium text-center px-2 ${platform.featured ? 'font-bold' : ''}`}>
                  {platform.name}
                </span>
                {platform.featured && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!platform.available && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-warning-100 text-warning-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
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