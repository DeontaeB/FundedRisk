import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComplianceOverview from '@/components/dashboard/ComplianceOverview'
import RecentTrades from '@/components/dashboard/RecentTrades'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import StatsCards from '@/components/dashboard/StatsCards'
import PerformanceChart from '@/components/dashboard/PerformanceChart'
import RiskMetrics from '@/components/dashboard/RiskMetrics'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10 rounded-2xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="heading-md text-secondary-900 mb-2">Welcome back, Trader</h1>
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
      </div>
    </DashboardLayout>
  )
}