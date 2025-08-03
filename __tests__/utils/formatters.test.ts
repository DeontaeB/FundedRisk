import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  formatTime,
  calculatePnL,
  getColorForValue,
} from '@/utils/formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive currency values', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats negative currency values', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentage values', () => {
      expect(formatPercentage(25.5)).toBe('25.5%')
    })

    it('formats negative percentages', () => {
      expect(formatPercentage(-10.25)).toBe('-10.3%')
    })
  })

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
    })
  })

  describe('formatDate', () => {
    it('formats date objects', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('Jan 15, 2024')
    })

    it('formats date strings', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
    })
  })

  describe('calculatePnL', () => {
    it('calculates buy trade P&L correctly', () => {
      const pnl = calculatePnL(100, 105, 2, 'buy')
      expect(pnl).toBe(10) // (105 - 100) * 1 * 2
    })

    it('calculates sell trade P&L correctly', () => {
      const pnl = calculatePnL(105, 100, 2, 'sell')
      expect(pnl).toBe(10) // (100 - 105) * -1 * 2
    })

    it('calculates losing trades correctly', () => {
      const pnl = calculatePnL(100, 95, 1, 'buy')
      expect(pnl).toBe(-5)
    })
  })

  describe('getColorForValue', () => {
    it('returns green for positive values', () => {
      expect(getColorForValue(100)).toBe('text-green-600')
    })

    it('returns red for negative values', () => {
      expect(getColorForValue(-100)).toBe('text-red-600')
    })

    it('returns gray for zero', () => {
      expect(getColorForValue(0)).toBe('text-gray-600')
    })
  })
})