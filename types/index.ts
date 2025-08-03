export interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
  stripeCustomerId?: string
  paymentStatus: string
}

export interface Trade {
  id: string
  userId: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  closePrice?: number
  orderType: string
  status: 'open' | 'closed' | 'cancelled'
  pnl?: number
  source: 'manual' | 'tradingview' | 'api'
  tradingViewId?: string
  createdAt: Date
  closedAt?: Date
  updatedAt: Date
}

export interface ComplianceRule {
  id: string
  userId: string
  name: string
  type: 'daily_loss' | 'position_size' | 'trading_hours' | 'max_trades'
  threshold: number
  isActive: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  userId: string
  complianceRuleId?: string
  type: 'warning' | 'violation' | 'info'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  isResolved: boolean
  metadata?: any
  createdAt: Date
  resolvedAt?: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  channel: 'email' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'failed'
  sentAt?: Date
  metadata?: any
  createdAt: Date
}

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'incomplete' | 'past_due'
  priceId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalTrades: number
  dailyTrades: number
  totalPnL: number
  dailyPnL: number
  complianceScore: number
  activeAlerts: number
}

export interface TradingViewWebhook {
  symbol: string
  action: 'buy' | 'sell' | 'close'
  quantity: number
  price?: number
  userId: string
  timestamp?: string
  orderType?: string
}