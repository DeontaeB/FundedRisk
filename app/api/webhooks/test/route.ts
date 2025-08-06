import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'

const prisma = new PrismaClient()

// POST /api/webhooks/test - Test webhook configuration
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Get user's webhook URL
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        webhookUrl: true,
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          take: 1
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (dbUser.subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Active subscription required',
          message: 'Please upgrade your account to test webhooks'
        },
        { status: 402 }
      )
    }

    if (!dbUser.webhookUrl) {
      return NextResponse.json(
        { error: 'No webhook URL configured' },
        { status: 400 }
      )
    }

    // Create test webhook payload
    const testPayload = {
      symbol: 'NQ',
      action: 'buy',
      quantity: 1,
      price: 15500.00,
      timestamp: new Date().toISOString(),
      test: true,
      message: 'Test webhook from FundedSafe'
    }

    // Send test webhook to user's URL
    try {
      const webhookResponse = await fetch(dbUser.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FundedSafe-Webhook-Test/1.0'
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const responseText = await webhookResponse.text().catch(() => 'No response body')
      
      // Log the test webhook event
      await prisma.webhookEvent.create({
        data: {
          userId: user.id,
          source: 'test',
          rawPayload: testPayload,
          symbol: testPayload.symbol,
          action: testPayload.action,
          quantity: testPayload.quantity,
          price: testPayload.price,
          status: webhookResponse.ok ? 'processed' : 'failed',
          processingError: webhookResponse.ok ? null : `HTTP ${webhookResponse.status}: ${responseText}`,
          processedAt: new Date()
        }
      })

      return NextResponse.json({
        success: webhookResponse.ok,
        webhookUrl: dbUser.webhookUrl,
        httpStatus: webhookResponse.status,
        responseBody: responseText,
        testPayload,
        message: webhookResponse.ok ? 
          'Test webhook sent successfully' : 
          `Test webhook failed with status ${webhookResponse.status}`
      })

    } catch (fetchError) {
      console.error('Webhook test error:', fetchError)
      
      // Log the failed test
      await prisma.webhookEvent.create({
        data: {
          userId: user.id,
          source: 'test',
          rawPayload: testPayload,
          symbol: testPayload.symbol,
          action: testPayload.action,
          quantity: testPayload.quantity,
          price: testPayload.price,
          status: 'failed',
          processingError: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        }
      })

      return NextResponse.json({
        success: false,
        webhookUrl: dbUser.webhookUrl,
        error: fetchError instanceof Error ? fetchError.message : 'Network error',
        testPayload,
        message: 'Failed to send test webhook'
      })
    }

  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET /api/webhooks/test - Get webhook test history
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)

    // Get webhook test history
    const testEvents = await prisma.webhookEvent.findMany({
      where: {
        userId: user.id,
        source: 'test'
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        status: true,
        processingError: true,
        rawPayload: true,
        createdAt: true,
        processedAt: true
      }
    })

    const totalTests = await prisma.webhookEvent.count({
      where: {
        userId: user.id,
        source: 'test'
      }
    })

    return NextResponse.json({
      success: true,
      tests: testEvents,
      pagination: {
        total: totalTests,
        limit,
        offset,
        hasMore: offset + limit < totalTests
      }
    })

  } catch (error) {
    console.error('Get webhook tests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook tests' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}