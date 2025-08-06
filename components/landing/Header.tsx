'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold font-display text-secondary-900">
                PropRuleTracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Reviews
            </Link>
            <Link href="/docs" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Docs
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <button className="btn-ghost">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="btn-primary">
                Start Free Trial
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-secondary-600 hover:text-primary-600 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-secondary-600 hover:text-primary-600 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-secondary-600 hover:text-primary-600 transition-colors">
                Reviews
              </Link>
              <Link href="/docs" className="text-secondary-600 hover:text-primary-600 transition-colors">
                Docs
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-secondary-200">
                <Link href="/auth/signin">
                  <button className="btn-ghost w-full">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="btn-primary w-full">
                    Start Free Trial
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}