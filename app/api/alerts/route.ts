import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const createAlertSchema = z.object({
  type: z.enum(['warning', 'violation', 'info'], { message: 'Invalid alert type' }),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  complianceRuleId: z.string().optional(),
  metadata: z.any().optional(),
})

const updateAlertSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
})

// GET /api/alerts - Get user's alerts
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const isRead = searchParams.get('read')
    const isResolved = searchParams.get('resolved')
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')

    const where: any = { userId: user.id }
    if (isRead !== null) where.isRead = isRead === 'true'
    if (isResolved !== null) where.isResolved = isResolved === 'true'
    if (severity) where.severity = severity
    if (type) where.type = type

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          complianceRule: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.alert.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    // Verify compliance rule belongs to user if provided
    if (validatedData.complianceRuleId) {
      const rule = await prisma.complianceRule.findFirst({
        where: {
          id: validatedData.complianceRuleId,
          userId: user.id
        }
      })

      if (!rule) {
        return NextResponse.json(
          { error: 'Compliance rule not found' },
          { status: 400 }
        )
      }
    }

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        ...validatedData,
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

    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    }, { status: 201 })

  } catch (error) {
    console.error('Create alert error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}