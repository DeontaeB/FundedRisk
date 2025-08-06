import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      session: session || null
    })
  } catch (error) {
    console.error('Session test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}