import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/test/api-health - Test all API endpoints health
export async function GET(request: NextRequest) {
  try {
    const results = {
      database: { status: 'unknown', error: null },
      authentication: { status: 'unknown', error: null },
      trades: { status: 'unknown', error: null },
      compliance: { status: 'unknown', error: null },
      alerts: { status: 'unknown', error: null },
      dashboard: { status: 'unknown', error: null }
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      const userCount = await prisma.user.count()
      results.database = { 
        status: 'healthy', 
        error: null, 
        data: { userCount }
      }
    } catch (error) {
      results.database = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Database connection failed'
      }
    }

    // Test authentication tables
    try {
      const sessionCount = await prisma.session.count()
      const accountCount = await prisma.account.count()
      results.authentication = { 
        status: 'healthy', 
        error: null,
        data: { sessionCount, accountCount }
      }
    } catch (error) {
      results.authentication = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Auth tables error'
      }
    }

    // Test trades functionality
    try {
      const tradeCount = await prisma.trade.count()
      const openTrades = await prisma.trade.count({ where: { status: 'open' } })
      results.trades = { 
        status: 'healthy', 
        error: null,
        data: { tradeCount, openTrades }
      }
    } catch (error) {
      results.trades = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Trades tables error'
      }
    }

    // Test compliance functionality
    try {
      const ruleCount = await prisma.complianceRule.count()
      const activeRules = await prisma.complianceRule.count({ where: { isActive: true } })
      results.compliance = { 
        status: 'healthy', 
        error: null,
        data: { ruleCount, activeRules }
      }
    } catch (error) {
      results.compliance = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Compliance tables error'
      }
    }

    // Test alerts functionality
    try {
      const alertCount = await prisma.alert.count()
      const unreadAlerts = await prisma.alert.count({ where: { isRead: false } })
      results.alerts = { 
        status: 'healthy', 
        error: null,
        data: { alertCount, unreadAlerts }
      }
    } catch (error) {
      results.alerts = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Alerts tables error'
      }
    }

    // Test prop firm data
    try {
      const propFirmCount = await prisma.propFirm.count()
      const propFirmAccountCount = await prisma.propFirmAccount.count()
      const userTradingAccountCount = await prisma.userTradingAccount.count()
      results.dashboard = { 
        status: 'healthy', 
        error: null,
        data: { propFirmCount, propFirmAccountCount, userTradingAccountCount }
      }
    } catch (error) {
      results.dashboard = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Dashboard data error'
      }
    }

    // Calculate overall health
    const errorCount = Object.values(results).filter(r => r.status === 'error').length
    const overallStatus = errorCount === 0 ? 'healthy' : errorCount < 3 ? 'degraded' : 'unhealthy'

    // List available endpoints
    const endpoints = {
      authentication: [
        'POST /api/auth/signup',
        'GET /api/auth/session',
        'POST /api/auth/signin',
        'POST /api/auth/signout'
      ],
      trades: [
        'GET /api/trades',
        'POST /api/trades',
        'GET /api/trades/[id]',
        'PATCH /api/trades/[id]',
        'DELETE /api/trades/[id]'
      ],
      compliance: [
        'GET /api/compliance/rules',
        'POST /api/compliance/rules',
        'GET /api/compliance/rules/[id]',
        'PATCH /api/compliance/rules/[id]',
        'DELETE /api/compliance/rules/[id]'
      ],
      alerts: [
        'GET /api/alerts',
        'POST /api/alerts',
        'GET /api/alerts/[id]',
        'PATCH /api/alerts/[id]',
        'DELETE /api/alerts/[id]'
      ],
      dashboard: [
        'GET /api/dashboard/stats'
      ],
      webhooks: [
        'POST /api/webhooks/secure/[token]',
        'POST /api/webhooks/tradingview',
        'POST /api/webhooks/stripe'
      ],
      testing: [
        'GET /api/test/database',
        'GET /api/test/session',
        'GET /api/test/api-health'
      ]
    }

    return NextResponse.json({
      success: true,
      overallStatus,
      timestamp: new Date().toISOString(),
      results,
      endpoints,
      summary: {
        totalEndpoints: Object.values(endpoints).flat().length,
        healthyServices: Object.values(results).filter(r => r.status === 'healthy').length,
        errorServices: errorCount,
        degradedServices: Object.values(results).filter(r => r.status === 'degraded').length
      }
    })

  } catch (error) {
    console.error('API health check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}