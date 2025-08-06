import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'trade', userId, data } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Send notification to WebSocket server
    const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3001'
    
    let notificationData
    
    if (type === 'trade') {
      notificationData = {
        userId: userId,
        event: 'trade-created',
        data: {
          symbol: data?.symbol || 'ES',
          side: data?.side || 'BUY', 
          quantity: data?.quantity || 1,
          price: data?.price || 4500.25,
          timestamp: new Date().toISOString(),
          ...data
        }
      }
    } else if (type === 'compliance') {
      notificationData = {
        userId: userId,
        event: 'compliance-alert',
        data: {
          title: data?.title || 'Test Compliance Alert',
          message: data?.message || 'This is a test compliance alert',
          severity: data?.severity || 'warning',
          ruleType: data?.ruleType || 'daily_loss',
          currentValue: data?.currentValue || 500,
          limit: data?.limit || 1000,
          timestamp: new Date().toISOString(),
          ...data
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type. Use "trade" or "compliance"' },
        { status: 400 }
      )
    }

    // Send to WebSocket server
    try {
      const response = await fetch(`${socketServerUrl}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      })

      if (!response.ok) {
        throw new Error(`WebSocket server responded with ${response.status}`)
      }

      const result = await response.json()

      return NextResponse.json({
        success: true,
        message: `${type} notification sent to user ${userId}`,
        data: notificationData,
        socketResponse: result
      })

    } catch (socketError) {
      console.error('Error sending to WebSocket server:', socketError)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send notification to WebSocket server',
        details: socketError instanceof Error ? socketError.message : 'Unknown error',
        notificationData // Still return the data that would have been sent
      })
    }

  } catch (error) {
    console.error('WebSocket test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid request body or server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to test WebSocket server connection
export async function GET() {
  try {
    const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3001'
    
    const healthResponse = await fetch(`${socketServerUrl}/health`)
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`)
    }
    
    const healthData = await healthResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'WebSocket server is running',
      serverUrl: socketServerUrl,
      healthData
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'WebSocket server is not accessible',
      details: error instanceof Error ? error.message : 'Unknown error',
      serverUrl: process.env.SOCKET_SERVER_URL || 'http://localhost:3001'
    })
  }
}