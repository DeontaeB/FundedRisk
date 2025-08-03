'use client'

import { useState, useEffect } from 'react'

export default function TestimonialsSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testimonials = [
    {
      content: "FundedSafe saved me $300 in reset fees in just 2 months. I was consistently hitting daily loss limits with my TradingView strategies until I connected to their platform. Now I'm consistently profitable and never worry about violations.",
      author: "Marcus Chen",
      role: "Prop Trader",
      company: "MyFundedFX Core",
      rating: 5,
      image: "MC",
      highlight: "Saved $300 in reset fees"
    },
    {
      content: "The TradingView webhook integration took 5 minutes to set up. My strategies now automatically check compliance before executing trades. It's like having a $150/hour risk manager for $2/day.",
      author: "Sarah Williams",
      role: "Algorithmic Trader", 
      company: "TopStep $100K",
      rating: 5,
      image: "SW",
      highlight: "5-minute setup"
    },
    {
      content: "I almost lost my $100K TopStep account to a daily loss violation. FundedSafe's alert stopped the trade before it executed. That one save paid for 5 years of the service.",
      author: "David Rodriguez",
      role: "Funded Trader",
      company: "TopStep Trading Combine",
      rating: 5,
      image: "DR",
      highlight: "Saved $100K account"
    },
    {
      content: "The alerts saved me from a major violation last week. I was about to place a trade that would have exceeded my daily limit and caused a $150 reset. FundedSafe caught it instantly.",
      author: "Emma Thompson",
      role: "Day Trader",
      company: "Earn2Trade Gauntlet",
      rating: 5,
      image: "ET",
      highlight: "Prevented $150 reset"
    },
    {
      content: "Best $65/month I spend on trading. The platform paid for itself by preventing just one compliance violation. I've been trading for 3 months with zero violations since connecting my TradingView.",
      author: "James Park",
      role: "Futures Trader",
      company: "MyFundedFX Pro",
      rating: 5,
      image: "JP",
      highlight: "Paid for itself"
    },
    {
      content: "Managing 4 prop firm accounts was stressful until FundedSafe. One webhook URL protects all my accounts. I sleep better knowing I can't accidentally violate rules overnight.",
      author: "Lisa Anderson",
      role: "Multi-Account Trader",
      company: "Multiple Prop Firms",
      rating: 5,
      image: "LA",
      highlight: "Protects 4 accounts"
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-secondary-50 to-primary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-6">
            Loved by <span className="gradient-text">10,000+</span> Traders
          </h2>
          <p className="text-large max-w-3xl mx-auto">
            Don't just take our word for it. Here's what successful traders are saying 
            about FundedSafe and how it's transformed their trading.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
            <div className="text-sm text-secondary-600">Average Rating</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">2,847</div>
            <div className="text-sm text-secondary-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-sm text-secondary-600">Would Recommend</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
            <div className="text-sm text-secondary-600">Violations Missed</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`card-premium hover:shadow-premium transition-all duration-300 hover:-translate-y-1 ${
                mounted ? 'animate-slide-up' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Highlight Quote */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-3 mb-4 border border-primary-200/50">
                <span className="text-sm font-medium text-primary-700">
                  "{testimonial.highlight}"
                </span>
              </div>

              {/* Content */}
              <blockquote className="text-secondary-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-secondary-900">{testimonial.author}</div>
                  <div className="text-sm text-secondary-600">{testimonial.role}</div>
                  <div className="text-xs text-primary-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-secondary-200/50">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-secondary-700">Trusted by pros</span>
            </div>
            <div className="w-px h-6 bg-secondary-300"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-secondary-700">14-day free trial</span>
            </div>
            <div className="w-px h-6 bg-secondary-300"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-secondary-700">No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}