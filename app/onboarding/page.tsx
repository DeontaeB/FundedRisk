import SimplifiedOnboarding from '@/components/onboarding/SimplifiedOnboarding'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-secondary-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold font-display text-secondary-900">PropRuleTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-600">
                Quick Setup
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimplifiedOnboarding />
        </div>
      </div>
    </div>
  )
}