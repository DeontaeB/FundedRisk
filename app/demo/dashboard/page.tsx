import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComplianceOverview from '@/components/dashboard/ComplianceOverview'
import RecentTrades from '@/components/dashboard/RecentTrades'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import StatsCards from '@/components/dashboard/StatsCards'
import PerformanceChart from '@/components/dashboard/PerformanceChart'
import RiskMetrics from '@/components/dashboard/RiskMetrics'

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="bg-white/80 backdrop-blur-sm border-b border-secondary-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-secondary-900">PropRuleTracker Dashboard</h1>
                <p className="text-sm text-secondary-600">Demo Mode - Experience the premium interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-200/50">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-primary-700">Demo Mode</span>
              </div>
              <a
                href="/"
                className="btn-primary"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10 rounded-2xl"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="heading-md text-secondary-900 mb-2">Welcome back, Demo Trader</h1>
                  <p className="text-large text-secondary-600">Here's your trading performance today</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-secondary-700">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          }>
            <StatsCards />
          </Suspense>
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={
                <div className="card">
                  <div className="h-6 bg-secondary-200 rounded w-1/4 mb-6"></div>
                  <div className="h-64 bg-secondary-200 rounded animate-pulse"></div>
                </div>
              }>
                <PerformanceChart />
              </Suspense>
              
              <Suspense fallback={
                <div className="card">
                  <div className="h-6 bg-secondary-200 rounded w-1/4 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-secondary-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              }>
                <RecentTrades />
              </Suspense>
            </div>
            
            {/* Right Column - 1/3 */}
            <div className="space-y-8">
              <Suspense fallback={
                <div className="card">
                  <div className="h-6 bg-secondary-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-secondary-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              }>
                <ComplianceOverview />
              </Suspense>
              
              <Suspense fallback={
                <div className="card">
                  <div className="h-6 bg-secondary-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-secondary-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              }>
                <AlertsPanel />
              </Suspense>
              
              <Suspense fallback={
                <div className="card">
                  <div className="h-6 bg-secondary-200 rounded w-1/2 mb-6"></div>
                  <div className="h-32 bg-secondary-200 rounded animate-pulse"></div>
                </div>
              }>
                <RiskMetrics />
              </Suspense>
            </div>
          </div>

          {/* Call to Action */}
          <div className="card-premium bg-gradient-to-br from-primary-600 to-accent-600 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                This is just a preview of what you'll get with PropRuleTracker. Start your free trial to access 
                real-time compliance monitoring, alerts, and all premium features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/signup"
                  className="relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-700 bg-white border border-transparent rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start Free 14-Day Trial
                </a>
                <a
                  href="/#features"
                  className="relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-transparent border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white backdrop-blur-sm transition-all duration-200"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}