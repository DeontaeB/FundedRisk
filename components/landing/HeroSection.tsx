'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Trust Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200/50 mb-8 ${mounted ? 'animate-fade-in' : ''}`}>
            <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-primary-700">
              Trusted by 10,000+ professional traders
            </span>
          </div>

          {/* Main Headline */}
          <h1 className={`heading-xl mb-6 ${mounted ? 'animate-slide-up' : ''}`}>
            Never Lose Your <span className="gradient-text">$100K</span> Account
            <br />
            to a <span className="gradient-text">$150 Mistake</span> Again
          </h1>

          {/* Subheadline */}
          <p className={`text-large max-w-3xl mx-auto mb-10 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
            FundedSafe automatically monitors your TradingView strategies and stops violations before they happen. 
            Protect your prop firm account for just $1.07/day - less than the cost of a coffee.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
            <Link href="/onboarding">
              <button className="btn-primary group relative overflow-hidden">
                <span className="relative z-10">Connect Your Prop Firm</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            </Link>
            <Link href="/demo/dashboard">
              <button className="btn-secondary group">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Live Demo
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className={`text-center ${mounted ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-secondary-500 mb-4">No credit card required • Cancel anytime • GDPR compliant</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-secondary-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SOC 2 Certified
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Bank-Grade Security
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className={`mt-16 relative ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.8s' }}>
          <div className="relative mx-auto max-w-5xl">
            {/* Dashboard Mockup */}
            <div className="relative bg-white rounded-2xl shadow-premium border border-secondary-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 px-6 py-4 border-b border-secondary-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <div className="ml-4 text-sm font-medium text-secondary-600">FundedSafe Dashboard</div>
                </div>
              </div>
              <div className="p-8">
                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6 border border-success-200">
                    <div className="text-3xl font-bold text-success-700 mb-2">98.5%</div>
                    <div className="text-sm text-success-600">Compliance Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
                    <div className="text-3xl font-bold text-primary-700 mb-2">$2,847</div>
                    <div className="text-sm text-primary-600">Today's P&L</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border border-accent-200">
                    <div className="text-3xl font-bold text-accent-700 mb-2">24</div>
                    <div className="text-sm text-accent-600">Active Positions</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-secondary-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-secondary-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            
            {/* Floating notifications */}
            <div className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-lg border border-secondary-200 p-4 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-medium text-secondary-700">Trade executed</div>
              </div>
            </div>
            
            <div className="absolute -left-4 top-3/4 bg-white rounded-xl shadow-lg border border-secondary-200 p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-medium text-secondary-700">Position size alert</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}