'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Trade } from '@/types'

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchTrades = async () => {
    if (!session) return

    try {
      setLoading(true)
      const response = await fetch('/api/trades')

      if (!response.ok) {
        throw new Error('Failed to fetch trades')
      }

      const data = await response.json()
      setTrades(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTrade = async (tradeData: Partial<Trade>) => {
    if (!session) return

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      })

      if (!response.ok) {
        throw new Error('Failed to create trade')
      }

      const newTrade = await response.json()
      setTrades(prev => [newTrade, ...prev])
      return newTrade
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!session) return

    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update trade')
      }

      const updatedTrade = await response.json()
      setTrades(prev => prev.map(trade => 
        trade.id === id ? updatedTrade : trade
      ))
      return updatedTrade
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchTrades()
  }, [session])

  return {
    trades,
    loading,
    error,
    refetch: fetchTrades,
    createTrade,
    updateTrade,
  }
}