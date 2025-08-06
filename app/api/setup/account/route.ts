import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// POST /api/setup/account - Create user trading account and generate webhook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { propFirmAccountId, accountNumber, startingBalance } = body

    // Validate required fields
    if (!propFirmAccountId || !startingBalance) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify prop firm account exists
    const propFirmAccount = await prisma.propFirmAccount.findUnique({
      where: { id: propFirmAccountId },
      include: { propFirm: true }
    })

    if (!propFirmAccount) {
      return NextResponse.json(
        { error: 'Invalid prop firm account' },
        { status: 400 }
      )
    }

    // Generate unique webhook URL if user doesn't have one
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    let webhookUrl = user?.webhookUrl
    if (!webhookUrl) {
      const webhookId = nanoid(16) // Generate short, URL-safe ID
      webhookUrl = `/webhook/${session.user.id}`
      
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { webhookUrl }
      })
    }

    // Create user trading account
    const userTradingAccount = await prisma.userTradingAccount.create({
      data: {
        userId: session.user.id,
        propFirmAccountId,
        accountNumber: accountNumber || undefined,
        startingBalance: parseFloat(startingBalance),
        currentBalance: parseFloat(startingBalance)
      }
    })

    // Mark user setup as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isSetupComplete: true }
    })

    // Get the complete account info to return
    const completeAccount = await prisma.userTradingAccount.findUnique({
      where: { id: userTradingAccount.id },
      include: {
        propFirmAccount: {
          include: {
            propFirm: true,
            ruleTemplates: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    // Generate full webhook URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fullWebhookUrl = `${baseUrl}/api${webhookUrl}`

    return NextResponse.json({
      success: true,
      data: {
        account: completeAccount,
        webhookUrl: fullWebhookUrl,
        setupComplete: true
      }
    })

  } catch (error) {
    console.error('Error creating trading account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/setup/account - Get user's current setup
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userAccounts: {
          where: { isActive: true },
          include: {
            propFirmAccount: {
              include: {
                propFirm: true,
                ruleTemplates: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fullWebhookUrl = user.webhookUrl ? `${baseUrl}/api${user.webhookUrl}` : null

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          isSetupComplete: user.isSetupComplete,
          webhookUrl: fullWebhookUrl
        },
        accounts: user.userAccounts
      }
    })

  } catch (error) {
    console.error('Error fetching user setup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/setup/account - Update account settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { accountId, currentBalance, accountNumber } = body

    // Verify user owns this account
    const account = await prisma.userTradingAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Update account
    const updatedAccount = await prisma.userTradingAccount.update({
      where: { id: accountId },
      data: {
        ...(currentBalance && { currentBalance: parseFloat(currentBalance) }),
        ...(accountNumber && { accountNumber })
      },
      include: {
        propFirmAccount: {
          include: {
            propFirm: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAccount
    })

  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}