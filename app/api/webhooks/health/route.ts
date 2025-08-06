import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { WebhookMonitor } from '@/lib/monitoring/webhook-monitor'

// GET /api/webhooks/health - Get webhook health status and metrics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const days = Math.min(parseInt(url.searchParams.get('days') || '7'), 30)

    // Generate comprehensive health report
    const healthReport = await WebhookMonitor.generateHealthReport(user.id)
    
    // Get performance metrics for specified time period
    const performanceMetrics = await WebhookMonitor.getPerformanceMetrics(user.id, days)

    return NextResponse.json({
      success: true,
      health: healthReport.health,
      metrics: performanceMetrics,
      recommendations: healthReport.recommendations,
      healingActions: healthReport.healingActions,
      reportGeneratedAt: healthReport.timestamp
    })

  } catch (error) {
    console.error('Get webhook health error:', error)
    return NextResponse.json(
      { error: 'Failed to get webhook health status' },
      { status: 500 }
    )
  }
}

// POST /api/webhooks/health - Trigger webhook health check and auto-healing
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Run health check
    const healthCheck = await WebhookMonitor.checkWebhookHealth(user.id)
    
    // Attempt auto-healing if issues detected
    const healingActions = await WebhookMonitor.autoHeal(user.id)
    
    // Run anomaly monitoring (may send notifications)
    await WebhookMonitor.monitorAnomalies(user.id)

    return NextResponse.json({
      success: true,
      message: 'Webhook health check completed',
      health: healthCheck,
      healingActions,
      actionsTaken: healingActions.length,
      nextRecommendedCheck: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    })

  } catch (error) {
    console.error('Webhook health check error:', error)
    return NextResponse.json(
      { error: 'Failed to perform webhook health check' },
      { status: 500 }
    )
  }
}