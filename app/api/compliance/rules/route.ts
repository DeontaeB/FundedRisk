import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const createRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  type: z.enum(['daily_loss', 'position_size', 'trading_hours', 'max_trades', 'max_drawdown'], {
    message: 'Invalid rule type'
  }),
  threshold: z.number().positive('Threshold must be positive'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  threshold: z.number().positive().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/compliance/rules - Get user's compliance rules
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const type = searchParams.get('type')

    const where: any = { userId: user.id }
    if (isActive !== null) where.isActive = isActive === 'true'
    if (type) where.type = type

    const rules = await prisma.complianceRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        alerts: {
          where: { isResolved: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: rules
    })

  } catch (error) {
    console.error('Get compliance rules error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance rules' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/compliance/rules - Create a new compliance rule
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRuleSchema.parse(body)

    // Check if rule with same name already exists for this user
    const existingRule = await prisma.complianceRule.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: validatedData.name
        }
      }
    })

    if (existingRule) {
      return NextResponse.json(
        { error: 'A rule with this name already exists' },
        { status: 400 }
      )
    }

    const rule = await prisma.complianceRule.create({
      data: {
        userId: user.id,
        ...validatedData,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Compliance rule created successfully',
      data: rule
    }, { status: 201 })

  } catch (error) {
    console.error('Create compliance rule error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create compliance rule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}