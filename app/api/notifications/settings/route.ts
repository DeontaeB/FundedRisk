import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const notificationSettingsSchema = z.object({
  phone: z.string().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  smsForWarnings: z.boolean().optional(),
  smsForCritical: z.boolean().optional(),
  emailForWarnings: z.boolean().optional(),
  emailForCritical: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string()
  }).optional()
})

// GET /api/notifications/settings - Get user notification settings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        phone: true,
        notificationPreferences: true
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse notification preferences with defaults
    const preferences = dbUser.notificationPreferences as any || {}
    
    const settings = {
      phone: dbUser.phone,
      emailEnabled: preferences.emailEnabled !== false, // Default true
      smsEnabled: preferences.smsEnabled === true, // Default false
      smsForWarnings: preferences.smsForWarnings === true,
      smsForCritical: preferences.smsForCritical !== false, // Default true for critical
      emailForWarnings: preferences.emailForWarnings !== false, // Default true
      emailForCritical: preferences.emailForCritical !== false, // Default true
      inAppEnabled: preferences.inAppEnabled !== false, // Default true
      quietHours: preferences.quietHours || {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/New_York'
      }
    }

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: 'Failed to get notification settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/notifications/settings - Update user notification settings
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const settings = notificationSettingsSchema.parse(body)

    const updateData: any = {}
    
    // Update phone number if provided
    if (settings.phone !== undefined) {
      updateData.phone = settings.phone || null
    }

    // Update notification preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationPreferences: true }
    })

    const currentPreferences = (currentUser?.notificationPreferences as any) || {}
    const newPreferences = {
      ...currentPreferences,
      ...Object.fromEntries(
        Object.entries(settings).filter(([key]) => key !== 'phone')
      )
    }

    updateData.notificationPreferences = newPreferences

    // Update user settings
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: {
        phone: settings.phone,
        ...newPreferences
      }
    })

  } catch (error) {
    console.error('Update notification settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}