import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  threshold: z.number().positive().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/compliance/rules/[id] - Get specific compliance rule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const rule = await prisma.complianceRule.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!rule) {
      return NextResponse.json(
        { error: 'Compliance rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: rule
    })

  } catch (error) {
    console.error('Get compliance rule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance rule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/compliance/rules/[id] - Update specific compliance rule
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
    const validatedData = updateRuleSchema.parse(body)

    // Check if rule exists and belongs to user
    const existingRule = await prisma.complianceRule.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Compliance rule not found' },
        { status: 404 }
      )
    }

    // Check if name is being changed and if it conflicts
    if (validatedData.name && validatedData.name !== existingRule.name) {
      const nameConflict = await prisma.complianceRule.findUnique({
        where: {
          userId_name: {
            userId: user.id,
            name: validatedData.name
          }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A rule with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updatedRule = await prisma.complianceRule.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      message: 'Compliance rule updated successfully',
      data: updatedRule
    })

  } catch (error) {
    console.error('Update compliance rule error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update compliance rule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/compliance/rules/[id] - Delete specific compliance rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Check if rule exists and belongs to user
    const rule = await prisma.complianceRule.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!rule) {
      return NextResponse.json(
        { error: 'Compliance rule not found' },
        { status: 404 }
      )
    }

    await prisma.complianceRule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Compliance rule deleted successfully'
    })

  } catch (error) {
    console.error('Delete compliance rule error:', error)
    return NextResponse.json(
      { error: 'Failed to delete compliance rule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}