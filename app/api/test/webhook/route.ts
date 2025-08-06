import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send test webhook to user's webhook URL
    const testPayload = {
      symbol: 'ES1!',
      action: 'buy',
      quantity: 1,
      price: 4500.25,
      timestamp: new Date().toISOString(),
      source: 'test'
    }

    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhook/${session.user.id}`
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'Test webhook sent successfully' : 'Test webhook failed',
      data: result
    })

  } catch (error) {
    console.error('Error sending test webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}