import { PrismaClient } from '@prisma/client'
import { sendNotification } from '@/lib/notifications/sender'

const prisma = new PrismaClient()

export interface WebhookHealth {
  userId: string
  isHealthy: boolean
  lastSuccess: Date | null
  lastFailure: Date | null
  failureRate: number
  averageResponseTime: number
  issues: string[]
}

export class WebhookMonitor {
  
  // Check overall webhook health for a user
  static async checkWebhookHealth(userId: string): Promise<WebhookHealth> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Get recent webhook events
    const recentEvents = await prisma.webhookEvent.findMany({
      where: {
        userId,
        createdAt: { gte: twentyFourHoursAgo }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
        createdAt: true,
        processedAt: true,
        processingError: true
      }
    })

    const totalEvents = recentEvents.length
    const failedEvents = recentEvents.filter(e => e.status === 'failed').length
    const successEvents = recentEvents.filter(e => e.status === 'processed').length
    const violationEvents = recentEvents.filter(e => e.status === 'rejected').length

    const failureRate = totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0
    
    // Calculate average response time
    const processedEvents = recentEvents.filter(e => e.processedAt && e.createdAt)
    const averageResponseTime = processedEvents.length > 0 ? 
      processedEvents.reduce((sum, event) => {
        const responseTime = event.processedAt!.getTime() - event.createdAt.getTime()
        return sum + responseTime
      }, 0) / processedEvents.length : 0

    // Find last success and failure
    const lastSuccess = recentEvents.find(e => e.status === 'processed')?.createdAt || null
    const lastFailure = recentEvents.find(e => e.status === 'failed')?.createdAt || null

    // Identify issues
    const issues: string[] = []
    
    if (totalEvents === 0) {
      issues.push('No webhook activity in the last 24 hours')
    }
    
    if (failureRate > 20) {
      issues.push(`High failure rate: ${failureRate.toFixed(1)}%`)
    }
    
    if (averageResponseTime > 5000) {
      issues.push(`Slow response time: ${(averageResponseTime / 1000).toFixed(1)}s`)
    }
    
    if (violationEvents > successEvents && violationEvents > 2) {
      issues.push('High number of compliance violations')
    }

    const isHealthy = issues.length === 0 && failureRate < 10

    return {
      userId,
      isHealthy,
      lastSuccess,
      lastFailure,
      failureRate,
      averageResponseTime,
      issues
    }
  }

  // Monitor for webhook anomalies and send alerts
  static async monitorAnomalies(userId: string): Promise<void> {
    const health = await this.checkWebhookHealth(userId)
    
    // Check for critical issues
    const criticalIssues = health.issues.filter(issue => 
      issue.includes('High failure rate') || 
      issue.includes('No webhook activity') ||
      issue.includes('compliance violations')
    )

    if (criticalIssues.length > 0) {
      await sendNotification({
        userId,
        type: 'webhook_health',
        title: '🔧 Webhook Health Alert',
        message: `Your webhook monitoring has detected issues:\n\n${criticalIssues.join('\n')}`,
        severity: 'warning',
        channels: ['in_app', 'email'],
        metadata: {
          healthCheck: health,
          issues: criticalIssues
        }
      })
    }
  }

  // Get webhook performance metrics
  static async getPerformanceMetrics(userId: string, days: number = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    // Daily event counts
    const dailyEvents = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_events,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as successful_events,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_events,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_events
      FROM webhook_events 
      WHERE user_id = ${userId} 
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    ` as any[]

    // Top symbols
    const topSymbols = await prisma.webhookEvent.groupBy({
      by: ['symbol'],
      where: {
        userId,
        createdAt: { gte: startDate },
        symbol: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Error patterns
    const errorPatterns = await prisma.webhookEvent.groupBy({
      by: ['processingError'],
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'failed',
        processingError: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    return {
      dailyEvents,
      topSymbols: topSymbols.map(s => ({
        symbol: s.symbol,
        count: s._count.id
      })),
      commonErrors: errorPatterns.map(e => ({
        error: e.processingError,
        count: e._count.id
      }))
    }
  }

  // Auto-heal common webhook issues
  static async autoHeal(userId: string): Promise<string[]> {
    const healingActions: string[] = []
    
    try {
      // Check for failed events that might be retryable
      const recentFailures = await prisma.webhookEvent.findMany({
        where: {
          userId,
          status: 'failed',
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          },
          processingError: {
            contains: 'timeout'
          }
        },
        take: 5
      })

      // Retry timeout failures (simplified - in production you'd want more sophisticated retry logic)
      if (recentFailures.length > 0) {
        healingActions.push(`Identified ${recentFailures.length} timeout failures for potential retry`)
      }

      // Check for webhook URL issues
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { webhookUrl: true }
      })

      if (!user?.webhookUrl) {
        healingActions.push('Missing webhook URL - user needs to reconfigure')
      }

      // Log healing attempts
      if (healingActions.length > 0) {
        console.log(`Webhook auto-heal for user ${userId}:`, healingActions)
      }

    } catch (error) {
      console.error('Auto-heal error:', error)
      healingActions.push('Auto-heal encountered an error')
    }

    return healingActions
  }

  // Generate webhook health report
  static async generateHealthReport(userId: string) {
    const health = await this.checkWebhookHealth(userId)
    const metrics = await this.getPerformanceMetrics(userId)
    const healingActions = await this.autoHeal(userId)

    return {
      timestamp: new Date(),
      health,
      metrics,
      healingActions,
      recommendations: this.generateRecommendations(health, metrics)
    }
  }

  private static generateRecommendations(
    health: WebhookHealth, 
    metrics: any
  ): string[] {
    const recommendations: string[] = []

    if (health.failureRate > 10) {
      recommendations.push('Consider reviewing your webhook endpoint implementation for better error handling')
    }

    if (health.averageResponseTime > 3000) {
      recommendations.push('Optimize your webhook endpoint response time to under 3 seconds')
    }

    if (metrics.commonErrors.length > 0) {
      recommendations.push('Address the most common errors: ' + 
        metrics.commonErrors.slice(0, 2).map((e: any) => e.error).join(', '))
    }

    if (!health.lastSuccess) {
      recommendations.push('Test your webhook configuration to ensure it\'s working properly')
    }

    return recommendations
  }
}

// Background task to monitor all user webhooks (would be run via cron job)
export async function monitorAllWebhooks(): Promise<void> {
  try {
    // Get all users with active subscriptions and webhook URLs
    const activeUsers = await prisma.user.findMany({
      where: {
        webhookUrl: { not: null },
        subscriptions: {
          some: {
            status: { in: ['active', 'trialing'] }
          }
        }
      },
      select: { id: true }
    })

    console.log(`Monitoring webhooks for ${activeUsers.length} users`)

    // Monitor each user
    for (const user of activeUsers) {
      try {
        await WebhookMonitor.monitorAnomalies(user.id)
      } catch (error) {
        console.error(`Error monitoring user ${user.id}:`, error)
      }
    }

  } catch (error) {
    console.error('Error in webhook monitoring task:', error)
  }
}