import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateAlertSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
})

// GET /api/alerts/[id] - Get specific alert
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const alert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        complianceRule: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: alert
    })

  } catch (error) {
    console.error('Get alert error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/alerts/[id] - Update specific alert
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAlertSchema.parse(body)

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    const updateData: any = { ...validatedData }
    
    // Set resolvedAt timestamp when resolving
    if (validatedData.isResolved === true && !existingAlert.resolvedAt) {
      updateData.resolvedAt = new Date()
    } else if (validatedData.isResolved === false) {
      updateData.resolvedAt = null
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: params.id },
      data: updateData,
      include: {
        complianceRule: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert
    })

  } catch (error) {
    console.error('Update alert error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/alerts/[id] - Delete specific alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Check if alert exists and belongs to user
    const alert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    await prisma.alert.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })

  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}