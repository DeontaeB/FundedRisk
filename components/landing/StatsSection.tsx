'use client'

import { useState, useEffect } from 'react'

export default function StatsSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    {
      number: "99.2%",
      label: "Violation Prevention Rate",
      description: "Our AI prevents compliance violations before they happen",
      icon: "🛡️"
    },
    {
      number: "34%",
      label: "Average Profit Increase",
      description: "Traders see improved performance with our guidance",
      icon: "📈"
    },
    {
      number: "< 100ms",
      label: "Real-time Monitoring",
      description: "Lightning-fast compliance checks on every trade",
      icon: "⚡"
    },
    {
      number: "15 mins",
      label: "Setup Time",
      description: "Get up and running in minutes, not hours",
      icon: "🚀"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-secondary-50 to-primary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-6">
            Proven Results That <span className="gradient-text">Matter</span>
          </h2>
          <p className="text-large max-w-3xl mx-auto">
            Join thousands of successful traders who've transformed their trading with our 
            compliance platform. Here's what the data shows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`card-premium text-center group hover:shadow-premium transition-all duration-300 hover:-translate-y-2 ${
                mounted ? 'animate-slide-up' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4 group-hover:animate-bounce">{stat.icon}</div>
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-3">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-secondary-900 mb-3">
                {stat.label}
              </div>
              <div className="text-sm text-secondary-600 leading-relaxed">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center space-x-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-secondary-200/50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-secondary-700">Live Monitoring</span>
            </div>
            <div className="w-px h-6 bg-secondary-300"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-secondary-700">Encrypted Data</span>
            </div>
            <div className="w-px h-6 bg-secondary-300"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-secondary-700">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}