'use client'

import { useState, useCallback, useEffect } from 'react'

interface PositionSizeCalculatorProps {
  accountBalance: number
  onCalculate?: (result: PositionCalculation) => void
  className?: string
}

interface PositionCalculation {
  positionSize: number
  riskAmount: number
  riskPercent: number
  stopDistance: number
  contractValue: number
  dollarPerTick: number
}

export default function PositionSizeCalculator({ 
  accountBalance, 
  onCalculate,
  className = '' 
}: PositionSizeCalculatorProps) {
  const [entryPrice, setEntryPrice] = useState<string>('4750.00')
  const [stopPrice, setStopPrice] = useState<string>('4725.00')
  const [riskPercent, setRiskPercent] = useState<string>('1.0')
  const [riskDollar, setRiskDollar] = useState<string>('')
  const [symbol, setSymbol] = useState<'ES' | 'NQ' | 'YM' | 'RTY' | 'CL' | 'GC'>('ES')
  const [usePercentRisk, setUsePercentRisk] = useState(true)
  const [calculation, setCalculation] = useState<PositionCalculation | null>(null)

  // Contract specifications
  const contractSpecs = {
    ES: { tickSize: 0.25, tickValue: 12.50, name: 'E-mini S&P 500' },
    NQ: { tickSize: 0.25, tickValue: 5.00, name: 'E-mini NASDAQ' },
    YM: { tickSize: 1.0, tickValue: 5.00, name: 'E-mini Dow' },
    RTY: { tickSize: 0.10, tickValue: 5.00, name: 'E-mini Russell' },
    CL: { tickSize: 0.01, tickValue: 10.00, name: 'Crude Oil' },
    GC: { tickSize: 0.10, tickValue: 10.00, name: 'Gold' }
  }

  const calculatePosition = useCallback(() => {
    const entry = parseFloat(entryPrice)
    const stop = parseFloat(stopPrice)
    const riskPct = parseFloat(riskPercent)
    const riskDol = parseFloat(riskDollar)
    
    if (!entry || !stop || (!riskPct && !riskDol)) {
      setCalculation(null)
      return
    }

    const spec = contractSpecs[symbol]
    const stopDistance = Math.abs(entry - stop)
    
    if (stopDistance === 0) {
      setCalculation(null)
      return
    }

    // Calculate risk amount
    const riskAmount = usePercentRisk 
      ? (accountBalance * riskPct / 100)
      : riskDol

    // Calculate ticks in stop distance
    const ticksInStop = stopDistance / spec.tickSize
    
    // Calculate position size (number of contracts)
    const positionSize = Math.floor(riskAmount / (ticksInStop * spec.tickValue))
    
    // Calculate actual dollar per tick for this position
    const dollarPerTick = positionSize * spec.tickValue
    
    // Contract value
    const contractValue = entry * positionSize * (symbol === 'ES' || symbol === 'NQ' ? 50 : symbol === 'YM' ? 5 : 1000)

    const result: PositionCalculation = {
      positionSize: Math.max(0, positionSize),
      riskAmount,
      riskPercent: (riskAmount / accountBalance) * 100,
      stopDistance,
      contractValue,
      dollarPerTick
    }

    setCalculation(result)
    onCalculate?.(result)
  }, [entryPrice, stopPrice, riskPercent, riskDollar, symbol, accountBalance, usePercentRisk])

  useEffect(() => {
    calculatePosition()
  }, [calculatePosition])

  // Sync risk dollar and percent
  useEffect(() => {
    if (usePercentRisk && riskPercent) {
      const dollarAmount = (accountBalance * parseFloat(riskPercent)) / 100
      setRiskDollar(dollarAmount.toFixed(0))
    }
  }, [riskPercent, accountBalance, usePercentRisk])

  useEffect(() => {
    if (!usePercentRisk && riskDollar) {
      const percentAmount = (parseFloat(riskDollar) / accountBalance) * 100
      setRiskPercent(percentAmount.toFixed(2))
    }
  }, [riskDollar, accountBalance, usePercentRisk])

  // Keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key.toLowerCase()) {
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            calculatePosition()
          }
          break
        case '1':
          setRiskPercent('1.0')
          break
        case '2':
          setRiskPercent('2.0')
          break
        case '3':
          setRiskPercent('3.0')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [calculatePosition])

  const getRiskColor = (risk: number) => {
    if (risk > 3) return 'text-red-400'
    if (risk > 2) return 'text-orange-400'
    if (risk > 1) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className={`bg-gray-900 text-white border border-gray-700 rounded p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-200">POSITION SIZE CALCULATOR</h3>
        <div className="text-xs text-gray-400">
          Press 1-3 for quick risk % • Ctrl+C to calculate
        </div>
      </div>

      {/* Symbol selector */}
      <div className="grid grid-cols-6 gap-1 mb-4">
        {(Object.keys(contractSpecs) as Array<keyof typeof contractSpecs>).map(sym => (
          <button
            key={sym}
            onClick={() => setSymbol(sym)}
            className={`py-1 px-2 rounded text-xs font-bold ${
              symbol === sym 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Entry Price</label>
            <input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
            <input
              type="number"
              step="0.01"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              <input
                type="radio"
                checked={usePercentRisk}
                onChange={() => setUsePercentRisk(true)}
                className="mr-1"
              />
              Risk %
            </label>
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              disabled={!usePercentRisk}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              <input
                type="radio"
                checked={!usePercentRisk}
                onChange={() => setUsePercentRisk(false)}
                className="mr-1"
              />
              Risk $
            </label>
            <input
              type="number"
              step="1"
              value={riskDollar}
              onChange={(e) => setRiskDollar(e.target.value)}
              disabled={usePercentRisk}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {calculation && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-400">Position Size</div>
              <div className="text-lg font-bold text-blue-400">
                {calculation.positionSize} contracts
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Risk Amount</div>
              <div className={`text-lg font-bold ${getRiskColor(calculation.riskPercent)}`}>
                ${calculation.riskAmount.toFixed(0)}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Stop Distance</div>
              <div className="text-sm font-mono text-white">
                {calculation.stopDistance.toFixed(2)} pts
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">$ Per Tick</div>
              <div className="text-sm font-mono text-white">
                ${calculation.dollarPerTick.toFixed(0)}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 space-y-1">
            <div>Contract Value: ${calculation.contractValue.toLocaleString()}</div>
            <div>Risk: {calculation.riskPercent.toFixed(2)}% of account</div>
            <div>
              {contractSpecs[symbol].name} • Tick: ${contractSpecs[symbol].tickValue.toFixed(2)}
            </div>
          </div>
          
          {calculation.positionSize === 0 && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ Risk too small for minimum position size
            </div>
          )}
          
          {calculation.riskPercent > 5 && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ Risk exceeds 5% - Consider reducing position
            </div>
          )}
        </div>
      )}
      
      {/* Quick risk buttons */}
      <div className="mt-3 flex space-x-2">
        {['0.5', '1.0', '1.5', '2.0'].map(risk => (
          <button
            key={risk}
            onClick={() => setRiskPercent(risk)}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded font-bold"
          >
            {risk}%
          </button>
        ))}
      </div>
    </div>
  )
}