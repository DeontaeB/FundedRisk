import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedPropFirms() {
  console.log('🌱 Seeding prop firms...')

  try {
    // Create MyFundedFX
    const myFundedFX = await prisma.propFirm.upsert({
      where: { name: 'myfundedfx' },
      update: {},
      create: {
        name: 'myfundedfx',
        displayName: 'MyFundedFX',
        website: 'https://myfundedfx.com',
        isActive: true
      }
    })

    // Create MyFundedFX account types
    const myFundedFXAccounts = [
      { name: 'Scale', accountSize: 25000 },
      { name: 'Core', accountSize: 50000 },
      { name: 'Pro', accountSize: 100000 },
      { name: 'Eval To Live', accountSize: 200000 }
    ]

    for (const accountData of myFundedFXAccounts) {
      const account = await prisma.propFirmAccount.upsert({
        where: {
          propFirmId_name_accountSize: {
            propFirmId: myFundedFX.id,
            name: accountData.name,
            accountSize: accountData.accountSize
          }
        },
        update: {},
        create: {
          propFirmId: myFundedFX.id,
          name: accountData.name,
          accountSize: accountData.accountSize,
          isActive: true
        }
      })

      // Create rules for each account
      const rules = [
        {
          ruleType: 'daily_loss',
          maxValue: accountData.accountSize * 0.05, // 5% daily loss limit
        },
        {
          ruleType: 'max_drawdown',
          percentage: 10, // 10% max drawdown
        },
        {
          ruleType: 'position_size',
          percentage: 10, // 10% max position size
        },
        {
          ruleType: 'trading_hours',
          timeStart: '09:30',
          timeEnd: '16:00',
          timezone: 'America/New_York'
        },
        {
          ruleType: 'max_contracts',
          maxValue: Math.floor(accountData.accountSize / 5000), // Rough estimate
        }
      ]

      for (const rule of rules) {
        await prisma.propFirmRuleTemplate.upsert({
          where: {
            id: `${account.id}-${rule.ruleType}`
          },
          update: rule,
          create: {
            id: `${account.id}-${rule.ruleType}`,
            propFirmId: myFundedFX.id,
            propFirmAccountId: account.id,
            isActive: true,
            ...rule
          }
        })
      }
    }

    // Create TopStep
    const topStep = await prisma.propFirm.upsert({
      where: { name: 'topstep' },
      update: {},
      create: {
        name: 'topstep',
        displayName: 'TopStep',
        website: 'https://www.topsteptrader.com',
        isActive: true
      }
    })

    // Create TopStep account types
    const topStepAccounts = [
      { name: 'Trading Combine $50K', accountSize: 50000 },
      { name: 'Trading Combine $100K', accountSize: 100000 },
      { name: 'Trading Combine $150K', accountSize: 150000 }
    ]

    for (const accountData of topStepAccounts) {
      const account = await prisma.propFirmAccount.upsert({
        where: {
          propFirmId_name_accountSize: {
            propFirmId: topStep.id,
            name: accountData.name,
            accountSize: accountData.accountSize
          }
        },
        update: {},
        create: {
          propFirmId: topStep.id,
          name: accountData.name,
          accountSize: accountData.accountSize,
          isActive: true
        }
      })

      // TopStep specific rules
      const rules = [
        {
          ruleType: 'daily_loss',
          maxValue: Math.min(accountData.accountSize * 0.03, 2000), // 3% or $2000 max
        },
        {
          ruleType: 'max_drawdown',
          maxValue: Math.min(accountData.accountSize * 0.06, 3000), // 6% or $3000 max
        },
        {
          ruleType: 'position_size',
          percentage: 5, // 5% max position size
        },
        {
          ruleType: 'trading_hours',
          timeStart: '08:30',
          timeEnd: '15:00',
          timezone: 'America/Chicago'
        },
        {
          ruleType: 'max_contracts',
          maxValue: Math.floor(accountData.accountSize / 10000), // Conservative estimate
        }
      ]

      for (const rule of rules) {
        await prisma.propFirmRuleTemplate.upsert({
          where: {
            id: `${account.id}-${rule.ruleType}`
          },
          update: rule,
          create: {
            id: `${account.id}-${rule.ruleType}`,
            propFirmId: topStep.id,
            propFirmAccountId: account.id,
            isActive: true,
            ...rule
          }
        })
      }
    }

    // Create Earn2Trade
    const earn2Trade = await prisma.propFirm.upsert({
      where: { name: 'earn2trade' },
      update: {},
      create: {
        name: 'earn2trade',
        displayName: 'Earn2Trade',
        website: 'https://earn2trade.com',
        isActive: true
      }
    })

    // Create Earn2Trade account types
    const earn2TradeAccounts = [
      { name: 'Gauntlet Mini', accountSize: 25000 },
      { name: 'Gauntlet Standard', accountSize: 50000 },
      { name: 'Gauntlet Pro', accountSize: 100000 }
    ]

    for (const accountData of earn2TradeAccounts) {
      const account = await prisma.propFirmAccount.upsert({
        where: {
          propFirmId_name_accountSize: {
            propFirmId: earn2Trade.id,
            name: accountData.name,
            accountSize: accountData.accountSize
          }
        },
        update: {},
        create: {
          propFirmId: earn2Trade.id,
          name: accountData.name,
          accountSize: accountData.accountSize,
          isActive: true
        }
      })

      // Earn2Trade specific rules
      const rules = [
        {
          ruleType: 'daily_loss',
          maxValue: accountData.accountSize * 0.04, // 4% daily loss limit
        },
        {
          ruleType: 'max_drawdown',
          maxValue: accountData.accountSize * 0.08, // 8% max drawdown
        },
        {
          ruleType: 'position_size',
          percentage: 8, // 8% max position size
        },
        {
          ruleType: 'trading_hours',
          timeStart: '09:00',
          timeEnd: '16:00',
          timezone: 'America/New_York'
        }
      ]

      for (const rule of rules) {
        await prisma.propFirmRuleTemplate.upsert({
          where: {
            id: `${account.id}-${rule.ruleType}`
          },
          update: rule,
          create: {
            id: `${account.id}-${rule.ruleType}`,
            propFirmId: earn2Trade.id,
            propFirmAccountId: account.id,
            isActive: true,
            ...rule
          }
        })
      }
    }

    console.log('✅ Prop firms seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding prop firms:', error)
    throw error
  }
}

export async function seedDatabase() {
  try {
    await seedPropFirms()
    console.log('🎉 Database seeded successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
}