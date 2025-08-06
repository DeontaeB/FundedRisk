import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-4xl lg:text-6xl font-bold font-display text-white mb-6 leading-tight">
            Ready to Trade with 
            <br />
            <span className="bg-gradient-to-r from-accent-300 to-white bg-clip-text text-transparent">
              Complete Confidence?
            </span>
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful traders who never worry about compliance violations. 
            Start your $1 trial today and experience the peace of mind that comes with 
            automated compliance monitoring.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/auth/signup">
            <button className="relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-primary-700 bg-white border border-transparent rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group">
              <span className="mr-2">🚀</span>
              Start $1 Trial
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
          <Link href="/dashboard-demo">
            <button className="relative inline-flex items-center justify-center px-8 py-5 text-lg font-medium text-white bg-transparent border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white backdrop-blur-sm transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Try Live Demo
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-primary-200 text-sm mb-6">
            $1 for 7 days, then $24.99/month • Cancel anytime
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-primary-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">7 days for $1</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Bank-grade security</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Loved by 10,000+ traders</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">99.2%</div>
            <div className="text-sm text-primary-200">Violation Prevention</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">10,000+</div>
            <div className="text-sm text-primary-200">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-primary-200">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}