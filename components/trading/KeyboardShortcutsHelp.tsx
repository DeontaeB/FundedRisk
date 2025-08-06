'use client'

import { useState, useEffect } from 'react'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === '?' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    {
      category: 'Trading Controls',
      shortcuts: [
        { key: 'Ctrl+P', description: 'Pause/Resume trading' },
        { key: 'Ctrl+E', description: 'Emergency stop' },
        { key: 'Ctrl+R', description: 'Resume from emergency stop' },
        { key: 'Ctrl+N', description: 'New order' },
        { key: 'Ctrl+F', description: 'Flatten all positions' }
      ]
    },
    {
      category: 'Navigation',
      shortcuts: [
        { key: '↑ ↓', description: 'Navigate trades list' },
        { key: 'Enter', description: 'Select trade' },
        { key: 'Ctrl+D', description: 'Cycle chart views' },
        { key: 'Tab', description: 'Focus next section' }
      ]
    },
    {
      category: 'Alerts & Risk',
      shortcuts: [
        { key: 'Space', description: 'Acknowledge top alert' },
        { key: 'Ctrl+A', description: 'Acknowledge all alerts' },
        { key: 'Escape', description: 'Clear all alerts' },
        { key: '1-3', description: 'Quick risk % (1%, 2%, 3%)' }
      ]
    },
    {
      category: 'Position Sizing',
      shortcuts: [
        { key: 'Ctrl+C', description: 'Calculate position size' },
        { key: '1', description: 'Set 1% risk' },
        { key: '2', description: 'Set 2% risk' },
        { key: '3', description: 'Set 3% risk' }
      ]
    },
    {
      category: 'Interface',
      shortcuts: [
        { key: 'Ctrl+?', description: 'Show/hide shortcuts' },
        { key: 'F11', description: 'Fullscreen mode' },
        { key: 'Ctrl+0', description: 'Reset zoom' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-lg border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-gray-400 mt-1">Master these shortcuts to trade faster</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Shortcuts grid */}
        <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-bold text-blue-400 mb-4">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm flex-1">
                      {shortcut.description}
                    </span>
                    <div className="flex space-x-1">
                      {shortcut.key.split(' ').map((key, index) => (
                        <kbd
                          key={index}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs font-mono text-gray-200"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tips */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-bold text-white mb-2">💡 Pro Tips</h4>
              <ul className="space-y-1">
                <li>• Keep hands on keyboard for fastest execution</li>
                <li>• Use Space bar to quickly acknowledge alerts</li>
                <li>• Emergency stop (Ctrl+E) immediately pauses all trading</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">⚡ Speed Trading</h4>
              <ul className="space-y-1">
                <li>• Navigate trades with arrow keys</li>
                <li>• Use number keys for quick risk sizing</li>
                <li>• Ctrl+F flattens all positions instantly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close instruction */}
        <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-700">
          Press <kbd className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs font-mono">ESC</kbd> or 
          <kbd className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs font-mono ml-1">Ctrl+?</kbd> to close
        </div>
      </div>
    </div>
  )
}