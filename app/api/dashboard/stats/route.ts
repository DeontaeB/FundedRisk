import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - periodDays)

    // Parallel queries for better performance
    const [
      totalTrades,
      openTrades,
      closedTrades,
      totalPnL,
      winningTrades,
      losingTrades,
      dailyPnL,
      recentTrades,
      activeAlerts,
      complianceRules,
      tradingAccounts
    ] = await Promise.all([
      // Total trades count
      prisma.trade.count({
        where: { userId: user.id }
      }),
      
      // Open trades count
      prisma.trade.count({
        where: { 
          userId: user.id,
          status: 'open'
        }
      }),
      
      // Closed trades count
      prisma.trade.count({
        where: { 
          userId: user.id,
          status: 'closed'
        }
      }),
      
      // Total P&L from closed trades
      prisma.trade.aggregate({
        where: {
          userId: user.id,
          status: 'closed',
          pnl: { not: null }
        },
        _sum: { pnl: true }
      }),
      
      // Winning trades count
      prisma.trade.count({
        where: {
          userId: user.id,
          status: 'closed',
          pnl: { gt: 0 }
        }
      }),
      
      // Losing trades count
      prisma.trade.count({
        where: {
          userId: user.id,
          status: 'closed',
          pnl: { lt: 0 }
        }
      }),
      
      // Daily P&L for the period
      prisma.trade.findMany({
        where: {
          userId: user.id,
          status: 'closed',
          closedAt: { gte: fromDate },
          pnl: { not: null }
        },
        select: {
          pnl: true,
          closedAt: true,
          symbol: true
        },
        orderBy: { closedAt: 'asc' }
      }),
      
      // Recent trades
      prisma.trade.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          symbol: true,
          side: true,
          quantity: true,
          price: true,
          closePrice: true,
          pnl: true,
          status: true,
          createdAt: true,
          closedAt: true
        }
      }),
      
      // Active alerts count
      prisma.alert.count({
        where: {
          userId: user.id,
          isResolved: false
        }
      }),
      
      // Active compliance rules count
      prisma.complianceRule.count({
        where: {
          userId: user.id,
          isActive: true
        }
      }),
      
      // User trading accounts
      prisma.userTradingAccount.findMany({
        where: {
          userId: user.id,
          isActive: true
        },
        include: {
          propFirmAccount: {
            include: {
              propFirm: true
            }
          }
        }
      })
    ])

    // Calculate statistics
    const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0
    const totalPnLValue = totalPnL._sum.pnl || 0
    
    // Calculate average win and loss
    const [avgWin, avgLoss] = await Promise.all([
      prisma.trade.aggregate({
        where: {
          userId: user.id,
          status: 'closed',
          pnl: { gt: 0 }
        },
        _avg: { pnl: true }
      }),
      prisma.trade.aggregate({
        where: {
          userId: user.id,
          status: 'closed',
          pnl: { lt: 0 }
        },
        _avg: { pnl: true }
      })
    ])

    const avgWinValue = avgWin._avg.pnl || 0
    const avgLossValue = Math.abs(avgLoss._avg.pnl || 0)
    const profitFactor = avgLossValue > 0 ? (avgWinValue * winningTrades) / (avgLossValue * losingTrades) : 0

    // Group daily P&L by date
    const dailyPnLMap = new Map<string, number>()
    dailyPnL.forEach(trade => {
      if (trade.closedAt && trade.pnl) {
        const dateKey = trade.closedAt.toISOString().split('T')[0]
        dailyPnLMap.set(dateKey, (dailyPnLMap.get(dateKey) || 0) + trade.pnl)
      }
    })

    const dailyPnLData = Array.from(dailyPnLMap.entries()).map(([date, pnl]) => ({
      date,
      pnl
    }))

    // Calculate current account balance (if we have trading accounts)
    const currentBalance = tradingAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
    const startingBalance = tradingAccounts.reduce((sum, account) => sum + account.startingBalance, 0)

    const stats = {
      // Trading Statistics
      trading: {
        totalTrades,
        openTrades,
        closedTrades,
        totalPnL: totalPnLValue,
        winningTrades,
        losingTrades,
        winRate: Math.round(winRate * 100) / 100,
        avgWin: Math.round(avgWinValue * 100) / 100,
        avgLoss: Math.round(avgLossValue * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        recentTrades
      },
      
      // Account Information
      account: {
        currentBalance,
        startingBalance,
        totalReturn: startingBalance > 0 ? ((currentBalance - startingBalance) / startingBalance) * 100 : 0,
        tradingAccounts: tradingAccounts.length
      },
      
      // Compliance & Risk
      compliance: {
        activeAlerts,
        complianceRules,
        violationsToday: 0 // This would need additional logic to calculate
      },
      
      // Chart Data
      charts: {
        dailyPnL: dailyPnLData
      },
      
      // Period Information
      period: {
        days: periodDays,
        fromDate: fromDate.toISOString(),
        toDate: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}