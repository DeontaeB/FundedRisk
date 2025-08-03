import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fundedsafe.com' },
    update: {},
    create: {
      email: 'demo@fundedsafe.com',
      firstName: 'Demo',
      lastName: 'User',
      password: hashedPassword,
      paymentStatus: 'active',
    },
  })

  console.log(`Created user: ${demoUser.email}`)

  // Create compliance rules for demo user
  const complianceRules = [
    {
      name: 'Daily Loss Limit',
      type: 'daily_loss',
      threshold: 500,
      description: 'Maximum daily loss should not exceed $500',
    },
    {
      name: 'Position Size Limit',
      type: 'position_size',
      threshold: 2,
      description: 'Position size should not exceed 2% of account',
    },
    {
      name: 'Maximum Daily Trades',
      type: 'max_trades',
      threshold: 10,
      description: 'Maximum 10 trades per day',
    },
    {
      name: 'Trading Hours Compliance',
      type: 'trading_hours',
      threshold: 100,
      description: 'Trading only during market hours (9:30 AM - 4:00 PM EST)',
    },
  ]

  for (const rule of complianceRules) {
    await prisma.complianceRule.upsert({
      where: {
        userId_name: {
          userId: demoUser.id,
          name: rule.name,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        ...rule,
      },
    })
  }

  console.log('Created compliance rules')

  // Create sample trades
  const sampleTrades = [
    {
      symbol: 'ES',
      side: 'buy',
      quantity: 2,
      price: 4750.25,
      closePrice: 4755.50,
      status: 'closed',
      pnl: 262.50,
      source: 'manual',
    },
    {
      symbol: 'NQ',
      side: 'sell',
      quantity: 1,
      price: 16890.75,
      closePrice: 16885.25,
      status: 'closed',
      pnl: 110.00,
      source: 'tradingview',
    },
    {
      symbol: 'ES',
      side: 'buy',
      quantity: 1,
      price: 4748.50,
      status: 'open',
      source: 'manual',
    },
  ]

  for (const trade of sampleTrades) {
    await prisma.trade.create({
      data: {
        userId: demoUser.id,
        ...trade,
        closedAt: trade.status === 'closed' ? new Date() : null,
      },
    })
  }

  console.log('Created sample trades')

  // Create sample alerts
  const sampleAlerts = [
    {
      type: 'warning',
      title: 'Position Size Warning',
      message: 'Your current position size is approaching the 2% limit',
      severity: 'medium',
    },
    {
      type: 'info',
      title: 'Daily Target Reached',
      message: 'You have reached 80% of your daily profit target',
      severity: 'low',
      isRead: true,
    },
  ]

  for (const alert of sampleAlerts) {
    await prisma.alert.create({
      data: {
        userId: demoUser.id,
        ...alert,
      },
    })
  }

  console.log('Created sample alerts')

  console.log('Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })