import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TradeAlert {
  symbol: string
  action: 'buy' | 'sell' | 'close_long' | 'close_short'
  quantity: number
  price?: number
  stopLoss?: number
  takeProfit?: number
  timestamp: string
}

export interface ComplianceViolation {
  ruleType: string
  currentValue: number
  limitValue: number
  severity: 'warning' | 'minor' | 'major' | 'critical'
  message: string
  shouldBlock: boolean
}

export interface ComplianceResult {
  isViolation: boolean
  violations: ComplianceViolation[]
  allowTrade: boolean
  warnings: string[]
}

export class ComplianceEngine {
  private userId: string
  private userTradingAccountId: string

  constructor(userId: string, userTradingAccountId: string) {
    this.userId = userId
    this.userTradingAccountId = userTradingAccountId
  }

  async validateTrade(alert: TradeAlert): Promise<ComplianceResult> {
    const result: ComplianceResult = {
      isViolation: false,
      violations: [],
      allowTrade: true,
      warnings: []
    }

    try {
      // Get user's trading account and prop firm rules
      const userAccount = await prisma.userTradingAccount.findUnique({
        where: { id: this.userTradingAccountId },
        include: {
          propFirmAccount: {
            include: {
              propFirm: true,
              ruleTemplates: {
                where: { isActive: true }
              }
            }
          }
        }
      })

      if (!userAccount) {
        throw new Error('Trading account not found')
      }

      // Get all applicable rules for this account
      const rules = userAccount.propFirmAccount.ruleTemplates

      // Check each compliance rule
      for (const rule of rules) {
        const violation = await this.checkRule(rule, alert, userAccount)
        if (violation) {
          result.violations.push(violation)
          result.isViolation = true
          
          if (violation.shouldBlock) {
            result.allowTrade = false
          }
        }
      }

      return result
    } catch (error) {
      console.error('Compliance validation error:', error)
      // In case of system error, block the trade for safety
      return {
        isViolation: true,
        violations: [{
          ruleType: 'system_error',
          currentValue: 0,
          limitValue: 0,
          severity: 'critical',
          message: 'System error during compliance check',
          shouldBlock: true
        }],
        allowTrade: false,
        warnings: []
      }
    }
  }

  private async checkRule(
    rule: any, 
    alert: TradeAlert, 
    userAccount: any
  ): Promise<ComplianceViolation | null> {
    
    switch (rule.ruleType) {
      case 'daily_loss':
        return await this.checkDailyLoss(rule, alert, userAccount)
      
      case 'max_drawdown':
        return await this.checkMaxDrawdown(rule, alert, userAccount)
      
      case 'position_size':
        return await this.checkPositionSize(rule, alert, userAccount)
      
      case 'trading_hours':
        return await this.checkTradingHours(rule, alert)
      
      case 'max_contracts':
        return await this.checkMaxContracts(rule, alert, userAccount)
      
      default:
        return null
    }
  }

  private async checkDailyLoss(
    rule: any, 
    alert: TradeAlert, 
    userAccount: any
  ): Promise<ComplianceViolation | null> {
    
    // Get today's trades to calculate current P&L
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaysTrades = await prisma.trade.findMany({
      where: {
        userTradingAccountId: this.userTradingAccountId,
        createdAt: {
          gte: today
        }
      }
    })

    // Calculate current daily P&L
    const currentDailyPnL = todaysTrades.reduce((sum, trade) => {
      return sum + (trade.pnl || 0)
    }, 0)

    // Estimate potential loss from this new trade
    const estimatedTradeLoss = this.estimateTradeLoss(alert, userAccount)
    const projectedDailyPnL = currentDailyPnL + estimatedTradeLoss

    const maxDailyLoss = rule.maxValue || 0

    if (Math.abs(projectedDailyPnL) > maxDailyLoss) {
      const severity = this.calculateSeverity(Math.abs(projectedDailyPnL), maxDailyLoss)
      
      return {
        ruleType: 'daily_loss',
        currentValue: Math.abs(projectedDailyPnL),
        limitValue: maxDailyLoss,
        severity,
        message: `Daily loss limit exceeded. Current: $${Math.abs(projectedDailyPnL).toFixed(2)}, Limit: $${maxDailyLoss.toFixed(2)}`,
        shouldBlock: severity === 'critical' || severity === 'major'
      }
    }

    return null
  }

  private async checkMaxDrawdown(
    rule: any, 
    alert: TradeAlert, 
    userAccount: any
  ): Promise<ComplianceViolation | null> {
    
    const currentBalance = userAccount.currentBalance
    const startingBalance = userAccount.startingBalance
    const maxDrawdownPercent = rule.percentage || 0
    
    const currentDrawdown = ((startingBalance - currentBalance) / startingBalance) * 100
    const maxAllowedDrawdown = maxDrawdownPercent

    if (currentDrawdown > maxAllowedDrawdown) {
      return {
        ruleType: 'max_drawdown',
        currentValue: currentDrawdown,
        limitValue: maxAllowedDrawdown,
        severity: 'critical',
        message: `Maximum drawdown exceeded. Current: ${currentDrawdown.toFixed(2)}%, Limit: ${maxAllowedDrawdown}%`,
        shouldBlock: true
      }
    }

    return null
  }

  private async checkPositionSize(
    rule: any, 
    alert: TradeAlert, 
    userAccount: any
  ): Promise<ComplianceViolation | null> {
    
    const positionValue = (alert.price || 0) * alert.quantity
    const accountBalance = userAccount.currentBalance
    const positionSizePercent = (positionValue / accountBalance) * 100
    
    const maxPositionSize = rule.percentage || rule.maxValue || 0
    
    if (positionSizePercent > maxPositionSize) {
      return {
        ruleType: 'position_size',
        currentValue: positionSizePercent,
        limitValue: maxPositionSize,
        severity: 'major',
        message: `Position size too large. Current: ${positionSizePercent.toFixed(2)}%, Limit: ${maxPositionSize}%`,
        shouldBlock: true
      }
    }

    return null
  }

  private async checkTradingHours(
    rule: any, 
    alert: TradeAlert
  ): Promise<ComplianceViolation | null> {
    
    if (!rule.timeStart || !rule.timeEnd) return null
    
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    const isWithinHours = currentTime >= rule.timeStart && currentTime <= rule.timeEnd
    
    if (!isWithinHours) {
      return {
        ruleType: 'trading_hours',
        currentValue: 0,
        limitValue: 0,
        severity: 'major',
        message: `Trading outside allowed hours. Current time: ${currentTime}, Allowed: ${rule.timeStart} - ${rule.timeEnd}`,
        shouldBlock: true
      }
    }

    return null
  }

  private async checkMaxContracts(
    rule: any, 
    alert: TradeAlert, 
    userAccount: any
  ): Promise<ComplianceViolation | null> {
    
    // Get current open positions for this symbol
    const openTrades = await prisma.trade.findMany({
      where: {
        userTradingAccountId: this.userTradingAccountId,
        symbol: alert.symbol,
        status: 'open'
      }
    })

    const currentContracts = openTrades.reduce((sum, trade) => sum + trade.quantity, 0)
    const newTotalContracts = currentContracts + alert.quantity
    const maxContracts = rule.maxValue || 0

    if (newTotalContracts > maxContracts) {
      return {
        ruleType: 'max_contracts',
        currentValue: newTotalContracts,
        limitValue: maxContracts,
        severity: 'major',
        message: `Maximum contracts exceeded for ${alert.symbol}. Would be: ${newTotalContracts}, Limit: ${maxContracts}`,
        shouldBlock: true
      }
    }

    return null
  }

  private estimateTradeLoss(alert: TradeAlert, userAccount: any): number {
    // Simple estimation - in real implementation, you'd use more sophisticated risk modeling
    const tradeValue = (alert.price || 0) * alert.quantity
    const estimatedRisk = tradeValue * 0.02 // Assume 2% risk per trade
    return alert.action.includes('sell') ? -estimatedRisk : estimatedRisk
  }

  private calculateSeverity(currentValue: number, limitValue: number): ComplianceViolation['severity'] {
    const ratio = currentValue / limitValue
    
    if (ratio >= 1.5) return 'critical'
    if (ratio >= 1.2) return 'major'
    if (ratio >= 1.1) return 'minor'
    return 'warning'
  }

  async logComplianceCheck(
    webhookEventId: string,
    result: ComplianceResult
  ): Promise<void> {
    
    for (const violation of result.violations) {
      await prisma.complianceCheck.create({
        data: {
          userTradingAccountId: this.userTradingAccountId,
          webhookEventId,
          ruleType: violation.ruleType,
          currentValue: violation.currentValue,
          limitValue: violation.limitValue,
          isViolation: true,
          violationSeverity: violation.severity,
          metadata: {
            message: violation.message,
            shouldBlock: violation.shouldBlock
          }
        }
      })
    }
  }
}

// Utility functions for compliance management
export class ComplianceUtils {
  static async createDefaultPropFirmRules() {
    // Create MyFundedFX rules
    const myFundedFX = await prisma.propFirm.upsert({
      where: { name: 'myfundedfx' },
      update: {},
      create: {
        name: 'myfundedfx',
        displayName: 'MyFundedFX',
        website: 'https://myfundedfx.com'
      }
    })

    // Create account types
    const accounts = [
      { name: 'Scale', accountSize: 25000 },
      { name: 'Core', accountSize: 50000 },
      { name: 'Pro', accountSize: 100000 },
      { name: 'Eval To Live', accountSize: 200000 }
    ]

    for (const account of accounts) {
      const propFirmAccount = await prisma.propFirmAccount.upsert({
        where: {
          propFirmId_name_accountSize: {
            propFirmId: myFundedFX.id,
            name: account.name,
            accountSize: account.accountSize
          }
        },
        update: {},
        create: {
          propFirmId: myFundedFX.id,
          name: account.name,
          accountSize: account.accountSize
        }
      })

      // Create default rules for each account
      const rules = [
        {
          ruleType: 'daily_loss',
          maxValue: account.accountSize * 0.05, // 5% daily loss limit
        },
        {
          ruleType: 'max_drawdown',
          percentage: 10, // 10% max drawdown
        },
        {
          ruleType: 'position_size',
          percentage: 10, // 10% max position size
        },
        {
          ruleType: 'trading_hours',
          timeStart: '09:30',
          timeEnd: '16:00',
          timezone: 'America/New_York'
        }
      ]

      for (const rule of rules) {
        await prisma.propFirmRuleTemplate.upsert({
          where: {
            id: `${propFirmAccount.id}-${rule.ruleType}`
          },
          update: {},
          create: {
            id: `${propFirmAccount.id}-${rule.ruleType}`,
            propFirmId: myFundedFX.id,
            propFirmAccountId: propFirmAccount.id,
            ...rule
          }
        })
      }
    }

    return myFundedFX
  }
}