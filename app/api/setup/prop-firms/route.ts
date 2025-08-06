import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/setup/prop-firms - List all prop firms and their accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const propFirms = await prisma.propFirm.findMany({
      where: { isActive: true },
      include: {
        accounts: {
          where: { isActive: true },
          orderBy: { accountSize: 'asc' }
        }
      },
      orderBy: { displayName: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: propFirms
    })

  } catch (error) {
    console.error('Error fetching prop firms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}