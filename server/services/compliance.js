const { PrismaClient } = require('@prisma/client')
const { io } = require('../index')

const prisma = new PrismaClient()

class ComplianceService {
  async checkTradeCompliance(userId, trade) {
    try {
      const rules = await prisma.complianceRule.findMany({
        where: {
          userId,
          isActive: true,
        },
      })

      for (const rule of rules) {
        await this.checkRule(userId, trade, rule)
      }
    } catch (error) {
      console.error('Compliance check error:', error)
    }
  }

  async checkRule(userId, trade, rule) {
    switch (rule.type) {
      case 'daily_loss':
        await this.checkDailyLoss(userId, trade, rule)
        break
      case 'position_size':
        await this.checkPositionSize(userId, trade, rule)
        break
      case 'max_trades':
        await this.checkMaxTrades(userId, trade, rule)
        break
      case 'trading_hours':
        await this.checkTradingHours(userId, trade, rule)
        break
    }
  }

  async checkDailyLoss(userId, trade, rule) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyPnL = await prisma.trade.aggregate({
      where: {
        userId,
        createdAt: { gte: today },
        status: 'closed',
      },
      _sum: { pnl: true },
    })

    const currentLoss = Math.abs(Math.min(dailyPnL._sum.pnl || 0, 0))

    if (currentLoss >= rule.threshold * 0.8) {
      await this.createAlert(userId, rule.id, {
        type: currentLoss >= rule.threshold ? 'violation' : 'warning',
        title: 'Daily Loss Limit Alert',
        message: `Current daily loss: $${currentLoss.toFixed(2)} (Limit: $${rule.threshold})`,
        severity: currentLoss >= rule.threshold ? 'high' : 'medium',
      })
    }
  }

  async checkPositionSize(userId, trade, rule) {
    // Mock account balance - in real app, get from broker API
    const accountBalance = 10000
    const positionValue = trade.quantity * trade.price
    const positionPercentage = (positionValue / accountBalance) * 100

    if (positionPercentage >= rule.threshold * 0.8) {
      await this.createAlert(userId, rule.id, {
        type: positionPercentage >= rule.threshold ? 'violation' : 'warning',
        title: 'Position Size Alert',
        message: `Position size: ${positionPercentage.toFixed(1)}% (Limit: ${rule.threshold}%)`,
        severity: positionPercentage >= rule.threshold ? 'high' : 'medium',
      })
    }
  }

  async checkMaxTrades(userId, trade, rule) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyTradeCount = await prisma.trade.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    })

    if (dailyTradeCount >= rule.threshold * 0.8) {
      await this.createAlert(userId, rule.id, {
        type: dailyTradeCount >= rule.threshold ? 'violation' : 'warning',
        title: 'Daily Trade Limit Alert',
        message: `Daily trades: ${dailyTradeCount} (Limit: ${rule.threshold})`,
        severity: dailyTradeCount >= rule.threshold ? 'high' : 'medium',
      })
    }
  }

  async checkTradingHours(userId, trade, rule) {
    const tradeTime = new Date(trade.createdAt)
    const hour = tradeTime.getHours()
    
    // Market hours: 9:30 AM - 4:00 PM EST
    const isAfterHours = hour < 9 || (hour === 9 && tradeTime.getMinutes() < 30) || hour >= 16

    if (isAfterHours) {
      await this.createAlert(userId, rule.id, {
        type: 'violation',
        title: 'Trading Hours Violation',
        message: `Trade executed outside market hours at ${tradeTime.toLocaleTimeString()}`,
        severity: 'high',
      })
    }
  }

  async createAlert(userId, ruleId, alertData) {
    const alert = await prisma.alert.create({
      data: {
        userId,
        complianceRuleId: ruleId,
        ...alertData,
      },
    })

    // Emit real-time alert
    if (io) {
      io.to(`user-${userId}`).emit('compliance-alert', alert)
    }

    // Send notification based on severity
    if (alert.severity === 'high') {
      await this.sendUrgentNotification(userId, alert)
    }

    return alert
  }

  async sendUrgentNotification(userId, alert) {
    // Send email/SMS for high severity alerts
    const notificationService = require('./notification')
    await notificationService.sendAlert(userId, alert)
  }

  async getComplianceScore(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalRules = await prisma.complianceRule.count({
      where: { userId, isActive: true },
    })

    const violations = await prisma.alert.count({
      where: {
        userId,
        type: 'violation',
        createdAt: { gte: today },
      },
    })

    const score = totalRules > 0 ? Math.max(0, ((totalRules - violations) / totalRules) * 100) : 100
    return Math.round(score)
  }
}

module.exports = new ComplianceService()