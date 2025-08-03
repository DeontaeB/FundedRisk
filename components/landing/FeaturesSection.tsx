'use client'

import { useState, useEffect } from 'react'

export default function FeaturesSection() {
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      title: "TradingView Webhook Integration",
      description: "Connect any TradingView strategy with one simple webhook URL. Every signal is automatically checked for compliance before execution.",
      icon: "📈",
      benefits: [
        "Works with any TradingView strategy",
        "One webhook URL for all prop firms",
        "Automatic prop firm rule detection",
        "Signal validation before execution"
      ],
      image: "/api/placeholder/500/300"
    },
    {
      title: "Prop Firm Rule Engine",
      description: "Pre-configured compliance rules for major prop firms like MyFundedFX, TopStep, Earn2Trade, and more.",
      icon: "🏛️",
      benefits: [
        "MyFundedFX (Scale, Core, Pro, Eval To Live)",
        "TopStep Trading Combines ($50K-$150K)",
        "Earn2Trade Gauntlet challenges",
        "Custom rule configuration"
      ],
      image: "/api/placeholder/500/300"
    },
    {
      title: "Real-Time Violation Prevention",
      description: "Stop trades before they violate your prop firm rules. Get instant alerts when approaching limits.",
      icon: "🛡️",
      benefits: [
        "Daily loss limit monitoring",
        "Position size validation",
        "Trading hours compliance",
        "Maximum contracts enforcement"
      ],
      image: "/api/placeholder/500/300"
    },
    {
      title: "Performance Analytics",
      description: "Track your trading performance and compliance score across all your prop firm accounts.",
      icon: "📊",
      benefits: [
        "Multi-account dashboard",
        "Compliance score tracking",
        "Performance metrics",
        "Risk analysis reports"
      ],
      image: "/api/placeholder/500/300"
    }
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-6">
            Everything You Need to <span className="gradient-text">Stay Compliant</span>
          </h2>
          <p className="text-large max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to maintain compliance,
            optimize performance, and trade with complete confidence.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center mb-12 bg-secondary-50 rounded-2xl p-2">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFeature === index
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <span className="mr-2">{feature.icon}</span>
              <span className="hidden sm:inline">{feature.title}</span>
              <span className="sm:hidden">{feature.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Feature Content */}
        <div className={`${mounted ? 'animate-fade-in' : ''}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-4xl mb-4">{features[activeFeature].icon}</div>
              <h3 className="heading-md mb-6">{features[activeFeature].title}</h3>
              <p className="text-large mb-8">{features[activeFeature].description}</p>
              
              <ul className="space-y-4">
                {features[activeFeature].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-secondary-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Feature Mockup */}
              <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl p-8 shadow-premium">
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-secondary-900">Live Monitoring</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-success-600 font-medium">Active</span>
                    </div>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg border border-success-200">
                      <span className="text-sm font-medium text-success-700">Compliance Score</span>
                      <span className="text-lg font-bold text-success-700">98.5%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <span className="text-sm font-medium text-primary-700">Daily P&L</span>
                      <span className="text-lg font-bold text-primary-700">+$1,247</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-warning-50 rounded-lg border border-warning-200">
                      <span className="text-sm font-medium text-warning-700">Position Size</span>
                      <span className="text-lg font-bold text-warning-700">1.8%</span>
                    </div>
                  </div>
                  
                  {/* Mock Activity Feed */}
                  <div className="mt-6 pt-6 border-t border-secondary-200">
                    <h5 className="text-sm font-medium text-secondary-700 mb-3">Recent Activity</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-secondary-600">
                        <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-2"></div>
                        Trade executed: ES +2 @ 4750.25
                      </div>
                      <div className="flex items-center text-xs text-secondary-600">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                        Compliance check: Passed
                      </div>
                      <div className="flex items-center text-xs text-secondary-600">
                        <div className="w-1.5 h-1.5 bg-warning-500 rounded-full mr-2"></div>
                        Alert: Approaching daily limit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-secondary-700">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-200/50 mb-6">
            <span className="text-sm font-medium text-primary-700">
              ✨ All features included in every plan
            </span>
          </div>
          <div>
            <button className="btn-primary mr-4">
              Start Free Trial
            </button>
            <button className="btn-ghost">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}