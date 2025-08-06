import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection with a simple query
    const userCount = await prisma.user.count()
    const propFirmCount = await prisma.propFirm.count()
    const tradeCount = await prisma.trade.count()
    
    // Test database health
    const health = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        propFirms: propFirmCount,
        trades: tradeCount,
        healthCheck: health
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}