import PropFirmSelector from '@/components/onboarding/PropFirmSelector'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-secondary-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold font-display text-secondary-900">FundedSafe</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-600">
                Step 1 of 3: Account Setup
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropFirmSelector />
        </div>
      </div>
    </div>
  )
}