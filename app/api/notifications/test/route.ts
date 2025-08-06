import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { sendTestNotification } from '@/lib/notifications/sender'
import { z } from 'zod'

const testNotificationSchema = z.object({
  channel: z.enum(['email', 'sms'])
})

// POST /api/notifications/test - Send test notification
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { channel } = testNotificationSchema.parse(body)

    // Send test notification
    const result = await sendTestNotification(user.id, channel)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${channel} notification sent successfully`,
        channel
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: `Failed to send test ${channel} notification`,
        channel
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Test notification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}