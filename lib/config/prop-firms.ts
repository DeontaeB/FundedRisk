// Prop Firm Configuration System
// This modular system makes it easy to add new firms and account types

export interface RuleTemplate {
  ruleType: 'daily_loss' | 'max_drawdown' | 'position_size' | 'max_contracts' | 'trading_hours' | 'profit_target' | 'daily_drawdown' | 'consistency_rule' | 'scaling_rule' | 'micro_scaling' | 'payout_rule'
  maxValue?: number
  percentage?: number
  timeStart?: string
  timeEnd?: string
  timezone?: string
  description?: string
  enabled?: boolean
  ratio?: string
  phase?: 'evaluation' | 'funded'
  minimumDays?: number
  minimumProfitPerDay?: number
  minimumPayout?: number
  payoutType?: 'performance-based' | 'time-based' | 'fixed'
  drawdownMode?: 'EOD' | 'real-time'
}

// New structured rule interfaces for Scale Plans
export interface GeneralRules {
  maxDrawdown: string | number
  drawdownMode: 'EOD' | 'real-time'
  activationFee?: string | number | null
}

export interface EvaluationRules {
  profitTarget: string | number
  dailyDrawdown?: string | number | null
  maxPosition: string | number
  microScaling: string
  consistencyRule: string | number
  scalingRule: boolean
}

export interface FundedRules {
  dailyDrawdown?: string | number | null
  maxPosition: string | number
  microScaling: string | null
  consistencyRule: boolean | string | number | null
  scalingRule: boolean
}

export interface PayoutRules {
  type: 'Performance Based' | 'Time Based' | 'Fixed' | string
  minimumDays?: number
  minimumProfitPerDay?: string | number
  minPayout: string | number
  firstPayout?: number // days for first payout (time-based)
  subsequentPayouts?: number // days between subsequent payouts (time-based)
}

export interface StructuredScalePlan {
  planName: string
  accountSize: string
  pricePerMonth: string
  generalRules: GeneralRules
  evaluationRules: EvaluationRules
  fundedRules: FundedRules
  payoutRules: PayoutRules
}

export interface PropFirmAccount {
  id: string
  name: string
  accountSize: number
  description?: string
  ruleTemplates: RuleTemplate[]
  monthlyPrice?: number
  structuredRules?: StructuredScalePlan // New field for structured scale plans
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    minimumTradingDays?: number
    profitTarget?: number
    evaluationPhases?: number
    drawdownMode?: 'EOD' | 'real-time'
    hasScaling?: boolean
  }
}

export interface PropFirm {
  id: string
  name: string
  displayName: string
  website?: string
  description?: string
  accounts: PropFirmAccount[]
  metadata?: {
    founded?: string
    headquarters?: string
    minAge?: number
    restrictedCountries?: string[]
  }
}

// Topstep Configuration
const topstepFirm: PropFirm = {
  id: 'topstep',
  name: 'topstep',
  displayName: 'TopStep',
  website: 'https://www.topsteptrader.com',
  description: 'Leading futures prop trading firm with proven track record',
  accounts: [
    {
      id: 'ts-50k',
      name: 'Trading Combine $50K',
      accountSize: 50000,
      description: 'Entry-level account perfect for developing futures traders',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 2000,
          description: 'Maximum daily loss cannot exceed $2,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          description: 'Maximum trailing drawdown limit'
        },
        { 
          ruleType: 'position_size', 
          percentage: 5,
          description: 'Maximum position size as percentage of account'
        },
        {
          ruleType: 'profit_target',
          maxValue: 3000,
          description: 'Target profit to pass evaluation'
        },
        {
          ruleType: 'trading_hours',
          timeStart: '08:30',
          timeEnd: '15:00',
          timezone: 'America/Chicago',
          description: 'Trading allowed during market hours only'
        }
      ],
      metadata: {
        difficulty: 'beginner',
        minimumTradingDays: 5,
        profitTarget: 3000,
        evaluationPhases: 1
      }
    },
    {
      id: 'ts-100k',
      name: 'Trading Combine $100K',
      accountSize: 100000,
      description: 'Mid-tier account for experienced traders',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 2000,
          description: 'Maximum daily loss cannot exceed $2,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          description: 'Maximum trailing drawdown limit'
        },
        { 
          ruleType: 'position_size', 
          percentage: 5,
          description: 'Maximum position size as percentage of account'
        },
        {
          ruleType: 'profit_target',
          maxValue: 6000,
          description: 'Target profit to pass evaluation'
        },
        {
          ruleType: 'trading_hours',
          timeStart: '08:30',
          timeEnd: '15:00',
          timezone: 'America/Chicago',
          description: 'Trading allowed during market hours only'
        }
      ],
      metadata: {
        difficulty: 'intermediate',
        minimumTradingDays: 5,
        profitTarget: 6000,
        evaluationPhases: 1
      }
    },
    {
      id: 'ts-150k',
      name: 'Trading Combine $150K',
      accountSize: 150000,
      description: 'Advanced account for seasoned professionals',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 2000,
          description: 'Maximum daily loss cannot exceed $2,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          description: 'Maximum trailing drawdown limit'
        },
        { 
          ruleType: 'position_size', 
          percentage: 5,
          description: 'Maximum position size as percentage of account'
        },
        {
          ruleType: 'profit_target',
          maxValue: 9000,
          description: 'Target profit to pass evaluation'
        },
        {
          ruleType: 'trading_hours',
          timeStart: '08:30',
          timeEnd: '15:00',
          timezone: 'America/Chicago',
          description: 'Trading allowed during market hours only'
        }
      ],
      metadata: {
        difficulty: 'advanced',
        minimumTradingDays: 5,
        profitTarget: 9000,
        evaluationPhases: 1
      }
    }
  ],
  metadata: {
    founded: '2012',
    headquarters: 'Chicago, IL',
    minAge: 18
  }
}

// Earn2Trade Configuration  
const earn2tradeFirm: PropFirm = {
  id: 'earn2trade',
  name: 'earn2trade',
  displayName: 'Earn2Trade',
  website: 'https://earn2trade.com',
  description: 'European-based prop firm with flexible trading rules',
  accounts: [
    {
      id: 'e2t-mini',
      name: 'Gauntlet Mini',
      accountSize: 25000,
      description: 'Small account size, perfect for beginners',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 1000,
          description: 'Daily loss limit of $1,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          description: 'Maximum drawdown of $2,000'
        },
        { 
          ruleType: 'position_size', 
          percentage: 8,
          description: 'Maximum 8% position size'
        },
        {
          ruleType: 'profit_target',
          maxValue: 2500,
          description: 'Profit target of $2,500'
        }
      ],
      metadata: {
        difficulty: 'beginner',
        minimumTradingDays: 10,
        profitTarget: 2500,
        evaluationPhases: 1
      }
    },
    {
      id: 'e2t-standard',
      name: 'Gauntlet Standard',
      accountSize: 50000,
      description: 'Standard account for regular traders',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 2000,
          description: 'Daily loss limit of $2,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 4000,
          description: 'Maximum drawdown of $4,000'
        },
        { 
          ruleType: 'position_size', 
          percentage: 8,
          description: 'Maximum 8% position size'
        },
        {
          ruleType: 'profit_target',
          maxValue: 5000,
          description: 'Profit target of $5,000'
        }
      ],
      metadata: {
        difficulty: 'intermediate',
        minimumTradingDays: 10,
        profitTarget: 5000,
        evaluationPhases: 1
      }
    },
    {
      id: 'e2t-pro',
      name: 'Gauntlet Pro',
      accountSize: 100000,
      description: 'Professional account with higher limits',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 4000,
          description: 'Daily loss limit of $4,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 8000,
          description: 'Maximum drawdown of $8,000'
        },
        { 
          ruleType: 'position_size', 
          percentage: 8,
          description: 'Maximum 8% position size'
        },
        {
          ruleType: 'profit_target',
          maxValue: 10000,
          description: 'Profit target of $10,000'
        }
      ],
      metadata: {
        difficulty: 'advanced',
        minimumTradingDays: 10,
        profitTarget: 10000,
        evaluationPhases: 1
      }
    }
  ],
  metadata: {
    founded: '2018',
    headquarters: 'Prague, Czech Republic',
    minAge: 18
  }
}

// MyFundedFutures Configuration (Updated with your specific requirements)
const myFundedFuturesFirm: PropFirm = {
  id: 'myfundedfutures',
  name: 'myfundedfutures',
  displayName: 'MyFundedFutures',
  website: 'https://myfundedfutures.com',
  description: 'Modern futures prop firm with innovative account structures',
  accounts: [
    {
      id: 'mff-starter',
      name: 'Starter',
      accountSize: 25000,
      description: 'Perfect for new futures traders getting started',
      ruleTemplates: [
        { 
          ruleType: 'daily_loss', 
          maxValue: 1000,
          description: 'Maximum daily loss of $1,000'
        },
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          description: 'Maximum drawdown of $2,000'
        },
        { 
          ruleType: 'position_size', 
          percentage: 4,
          description: 'Conservative 4% position sizing'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          description: 'Maximum 3 contracts per position'
        },
        {
          ruleType: 'profit_target',
          maxValue: 2000,
          description: 'Profit target of $2,000'
        }
      ],
      metadata: {
        difficulty: 'beginner',
        minimumTradingDays: 5,
        profitTarget: 2000,
        evaluationPhases: 1
      }
    },
    // Scale Plan 50K
    {
      id: 'mff-scale-50k',
      name: '$50K Scale Plan',
      accountSize: 50000,
      monthlyPrice: 127,
      description: 'Innovative scaling plan with performance-based payouts and micro contract ratios',
      structuredRules: {
        planName: "Scale",
        accountSize: "$50K",
        pricePerMonth: "$127",
        generalRules: {
          maxDrawdown: "$2K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$3K",
          dailyDrawdown: null,
          maxPosition: "3 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: true
        },
        fundedRules: {
          dailyDrawdown: null,
          maxPosition: "3 Contracts",
          microScaling: "5:1",
          consistencyRule: true,
          scalingRule: true
        },
        payoutRules: {
          type: "Performance Based",
          minimumDays: 5,
          minimumProfitPerDay: "$100",
          minPayout: "$250"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 3000,
          phase: 'evaluation',
          description: 'Profit target of $3,000 to pass evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          phase: 'evaluation',
          description: 'Maximum 3 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'evaluation',
          description: 'Scaling rules are active during evaluation phase'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation) in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          phase: 'funded',
          description: 'Maximum 3 contracts per position in funded phase'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '5:1',
          phase: 'funded',
          description: 'Micro contracts scale at 5:1 ratio in funded phase'
        },
        {
          ruleType: 'consistency_rule',
          enabled: true,
          phase: 'funded',
          description: 'Consistency rule remains active in funded phase'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'funded',
          description: 'Scaling rules are active in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'performance-based',
          minimumDays: 5,
          minimumProfitPerDay: 100,
          minimumPayout: 250,
          description: 'Performance-based payouts: minimum 5 days, $100/day, $250 minimum payout'
        }
      ],
      metadata: {
        difficulty: 'intermediate',
        minimumTradingDays: 5,
        profitTarget: 3000,
        evaluationPhases: 2,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Scale Plan 100K
    {
      id: 'mff-scale-100k',
      name: '$100K Scale Plan',
      accountSize: 100000,
      monthlyPrice: 267,
      description: 'Advanced scaling plan with higher limits and enhanced performance-based payouts',
      structuredRules: {
        planName: "Scale",
        accountSize: "$100K",
        pricePerMonth: "$267",
        generalRules: {
          maxDrawdown: "$3K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$6K",
          dailyDrawdown: null,
          maxPosition: "6 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: true
        },
        fundedRules: {
          dailyDrawdown: null,
          maxPosition: "6 Contracts",
          microScaling: "5:1",
          consistencyRule: true,
          scalingRule: true
        },
        payoutRules: {
          type: "Performance Based",
          minimumDays: 5,
          minimumProfitPerDay: "$200",
          minPayout: "$250"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $3,000 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 6000,
          phase: 'evaluation',
          description: 'Profit target of $6,000 to pass evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 6,
          phase: 'evaluation',
          description: 'Maximum 6 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'evaluation',
          description: 'Scaling rules are active during evaluation phase'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $3,000 (End of Day calculation) in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 6,
          phase: 'funded',
          description: 'Maximum 6 contracts per position in funded phase'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '5:1',
          phase: 'funded',
          description: 'Micro contracts scale at 5:1 ratio in funded phase'
        },
        {
          ruleType: 'consistency_rule',
          enabled: true,
          phase: 'funded',
          description: 'Consistency rule remains active in funded phase'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'funded',
          description: 'Scaling rules are active in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'performance-based',
          minimumDays: 5,
          minimumProfitPerDay: 200,
          minimumPayout: 250,
          description: 'Performance-based payouts: minimum 5 days, $200/day, $250 minimum payout'
        }
      ],
      metadata: {
        difficulty: 'advanced',
        minimumTradingDays: 5,
        profitTarget: 6000,
        evaluationPhases: 2,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Scale Plan 150K
    {
      id: 'mff-scale-150k',
      name: '$150K Scale Plan',
      accountSize: 150000,
      monthlyPrice: 377,
      description: 'Elite scaling plan with maximum limits for professional traders and premium payouts',
      structuredRules: {
        planName: "Scale",
        accountSize: "$150K",
        pricePerMonth: "$377",
        generalRules: {
          maxDrawdown: "$4.5K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$9K",
          dailyDrawdown: null,
          maxPosition: "9 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: true
        },
        fundedRules: {
          dailyDrawdown: null,
          maxPosition: "9 Contracts",
          microScaling: "5:1",
          consistencyRule: true,
          scalingRule: true
        },
        payoutRules: {
          type: "Performance Based",
          minimumDays: 5,
          minimumProfitPerDay: "$300",
          minPayout: "$250"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 4500,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $4,500 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 9000,
          phase: 'evaluation',
          description: 'Profit target of $9,000 to pass evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 9,
          phase: 'evaluation',
          description: 'Maximum 9 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'evaluation',
          description: 'Scaling rules are active during evaluation phase'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 4500,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $4,500 (End of Day calculation) in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 9,
          phase: 'funded',
          description: 'Maximum 9 contracts per position in funded phase'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '5:1',
          phase: 'funded',
          description: 'Micro contracts scale at 5:1 ratio in funded phase'
        },
        {
          ruleType: 'consistency_rule',
          enabled: true,
          phase: 'funded',
          description: 'Consistency rule remains active in funded phase'
        },
        {
          ruleType: 'scaling_rule',
          enabled: true,
          phase: 'funded',
          description: 'Scaling rules are active in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'performance-based',
          minimumDays: 5,
          minimumProfitPerDay: 300,
          minimumPayout: 250,
          description: 'Performance-based payouts: minimum 5 days, $300/day, $250 minimum payout'
        }
      ],
      metadata: {
        difficulty: 'expert',
        minimumTradingDays: 5,
        profitTarget: 9000,
        evaluationPhases: 2,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Core Plan 50K (Single size option)
    {
      id: 'mff-core-50k',
      name: '$50K Core Plan',
      accountSize: 50000,
      monthlyPrice: 77,
      description: 'Essential futures trading plan with proven rules and performance-based payouts',
      structuredRules: {
        planName: "Core",
        accountSize: "$50K",
        pricePerMonth: "$77",
        generalRules: {
          maxDrawdown: "$2K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$3K",
          dailyDrawdown: "Yes",
          maxPosition: "3 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: true
        },
        fundedRules: {
          dailyDrawdown: null,
          maxPosition: "3 Contracts",
          microScaling: "5:1",
          consistencyRule: true,
          scalingRule: true
        },
        payoutRules: {
          type: "Performance Based",
          minimumDays: 5,
          minimumProfitPerDay: "$100",
          minPayout: "$250"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 3000,
          phase: 'evaluation',
          description: 'Profit target of $3,000 to pass evaluation'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'evaluation',
          description: 'Daily drawdown limit is enforced during evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          phase: 'evaluation',
          description: 'Maximum 3 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation) in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          phase: 'funded',
          description: 'Maximum 3 contracts per position in funded phase'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '5:1',
          phase: 'funded',
          description: 'Micro contracts scale at 5:1 ratio in funded phase'
        },
        {
          ruleType: 'consistency_rule',
          enabled: true,
          phase: 'funded',
          description: 'Consistency rule remains active in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'performance-based',
          minimumDays: 5,
          minimumProfitPerDay: 100,
          minimumPayout: 250,
          description: 'Performance-based payouts: minimum 5 days, $100/day, $250 minimum payout'
        }
      ],
      metadata: {
        difficulty: 'beginner',
        minimumTradingDays: 5,
        profitTarget: 3000,
        evaluationPhases: 2,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Pro Plan 50K
    {
      id: 'mff-pro-50k',
      name: '$50K Pro Plan',
      accountSize: 50000,
      monthlyPrice: 227,
      description: 'Professional trading plan with time-based payouts and enhanced funded limits',
      structuredRules: {
        planName: "Pro",
        accountSize: "$50K",
        pricePerMonth: "$227",
        generalRules: {
          maxDrawdown: "$2K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$3K",
          dailyDrawdown: "Yes",
          maxPosition: "3 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: false
        },
        fundedRules: {
          dailyDrawdown: "Yes",
          maxPosition: "5 Contracts",
          microScaling: null,
          consistencyRule: null,
          scalingRule: false
        },
        payoutRules: {
          type: "Time Based",
          firstPayout: 14,
          subsequentPayouts: 14,
          minPayout: "$1,000"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 3000,
          phase: 'evaluation',
          description: 'Profit target of $3,000 to pass evaluation'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'evaluation',
          description: 'Daily drawdown limit is enforced during evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 3,
          phase: 'evaluation',
          description: 'Maximum 3 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 2000,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $2,000 (End of Day calculation) in funded phase'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'funded',
          description: 'Daily drawdown limit is enforced in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 5,
          phase: 'funded',
          description: 'Maximum 5 contracts per position in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'time-based',
          minimumDays: 14,
          minimumPayout: 1000,
          description: 'Time-based payouts: first payout after 14 days, then every 14 days, $1,000 minimum'
        }
      ],
      metadata: {
        difficulty: 'advanced',
        minimumTradingDays: 14,
        profitTarget: 3000,
        evaluationPhases: 1,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Pro Plan 100K (Most Popular)
    {
      id: 'mff-pro-100k',
      name: '$100K Pro Plan',
      accountSize: 100000,
      monthlyPrice: 344,
      description: 'Most popular professional plan with higher limits and time-based payouts',
      structuredRules: {
        planName: "Pro",
        accountSize: "$100K",
        pricePerMonth: "$344",
        generalRules: {
          maxDrawdown: "$3K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$6K",
          dailyDrawdown: "Yes",
          maxPosition: "6 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: false
        },
        fundedRules: {
          dailyDrawdown: "Yes",
          maxPosition: "10 Contracts",
          microScaling: null,
          consistencyRule: null,
          scalingRule: false
        },
        payoutRules: {
          type: "Time Based",
          firstPayout: 14,
          subsequentPayouts: 14,
          minPayout: "$1,000"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $3,000 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 6000,
          phase: 'evaluation',
          description: 'Profit target of $6,000 to pass evaluation'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'evaluation',
          description: 'Daily drawdown limit is enforced during evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 6,
          phase: 'evaluation',
          description: 'Maximum 6 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 3000,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $3,000 (End of Day calculation) in funded phase'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'funded',
          description: 'Daily drawdown limit is enforced in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 10,
          phase: 'funded',
          description: 'Maximum 10 contracts per position in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'time-based',
          minimumDays: 14,
          minimumPayout: 1000,
          description: 'Time-based payouts: first payout after 14 days, then every 14 days, $1,000 minimum'
        }
      ],
      metadata: {
        difficulty: 'advanced',
        minimumTradingDays: 14,
        profitTarget: 6000,
        evaluationPhases: 1,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    },

    // Pro Plan 150K
    {
      id: 'mff-pro-150k',
      name: '$150K Pro Plan',
      accountSize: 150000,
      monthlyPrice: 477,
      description: 'Elite professional plan with maximum limits and time-based payouts',
      structuredRules: {
        planName: "Pro",
        accountSize: "$150K",
        pricePerMonth: "$477",
        generalRules: {
          maxDrawdown: "$4.5K",
          drawdownMode: "EOD",
          activationFee: null
        },
        evaluationRules: {
          profitTarget: "$9K",
          dailyDrawdown: "Yes",
          maxPosition: "9 Contracts",
          microScaling: "10:1",
          consistencyRule: "50%",
          scalingRule: false
        },
        fundedRules: {
          dailyDrawdown: "Yes",
          maxPosition: "15 Contracts",
          microScaling: null,
          consistencyRule: null,
          scalingRule: false
        },
        payoutRules: {
          type: "Time Based",
          firstPayout: 14,
          subsequentPayouts: 14,
          minPayout: "$1,000"
        }
      },
      ruleTemplates: [
        // Evaluation Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 4500,
          phase: 'evaluation',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $4,500 (End of Day calculation)'
        },
        {
          ruleType: 'profit_target',
          maxValue: 9000,
          phase: 'evaluation',
          description: 'Profit target of $9,000 to pass evaluation'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'evaluation',
          description: 'Daily drawdown limit is enforced during evaluation'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 9,
          phase: 'evaluation',
          description: 'Maximum 9 contracts per position during evaluation'
        },
        {
          ruleType: 'micro_scaling',
          ratio: '10:1',
          phase: 'evaluation',
          description: 'Micro contracts scale at 10:1 ratio during evaluation'
        },
        {
          ruleType: 'consistency_rule',
          percentage: 50,
          phase: 'evaluation',
          description: '50% consistency rule - no single day can exceed 50% of total profit'
        },
        
        // Funded Phase Rules
        { 
          ruleType: 'max_drawdown', 
          maxValue: 4500,
          phase: 'funded',
          drawdownMode: 'EOD',
          description: 'Maximum drawdown of $4,500 (End of Day calculation) in funded phase'
        },
        {
          ruleType: 'daily_drawdown',
          enabled: true,
          phase: 'funded',
          description: 'Daily drawdown limit is enforced in funded phase'
        },
        { 
          ruleType: 'max_contracts', 
          maxValue: 15,
          phase: 'funded',
          description: 'Maximum 15 contracts per position in funded phase'
        },
        
        // Payout Rules
        {
          ruleType: 'payout_rule',
          payoutType: 'time-based',
          minimumDays: 14,
          minimumPayout: 1000,
          description: 'Time-based payouts: first payout after 14 days, then every 14 days, $1,000 minimum'
        }
      ],
      metadata: {
        difficulty: 'expert',
        minimumTradingDays: 14,
        profitTarget: 9000,
        evaluationPhases: 1,
        drawdownMode: 'EOD',
        hasScaling: true
      }
    }
  ],
  metadata: {
    founded: '2021',
    headquarters: 'Dallas, TX',
    minAge: 18
  }
}

// Main export - all configured prop firms
export const PROP_FIRMS: PropFirm[] = [
  topstepFirm,
  earn2tradeFirm,
  myFundedFuturesFirm
]

// Utility functions for working with prop firm data
export const getPropFirmById = (id: string): PropFirm | undefined => {
  return PROP_FIRMS.find(firm => firm.id === id)
}

export const getAccountById = (firmId: string, accountId: string): PropFirmAccount | undefined => {
  const firm = getPropFirmById(firmId)
  return firm?.accounts.find(account => account.id === accountId)
}

export const getRulesForAccount = (firmId: string, accountId: string): RuleTemplate[] => {
  const account = getAccountById(firmId, accountId)
  return account?.ruleTemplates || []
}

export const getRulesForPhase = (firmId: string, accountId: string, phase: 'evaluation' | 'funded'): RuleTemplate[] => {
  const rules = getRulesForAccount(firmId, accountId)
  return rules.filter(rule => !rule.phase || rule.phase === phase)
}

export const getAccountPhases = (firmId: string, accountId: string): Array<'evaluation' | 'funded'> => {
  const rules = getRulesForAccount(firmId, accountId)
  const phases = new Set<'evaluation' | 'funded'>()
  
  rules.forEach(rule => {
    if (rule.phase) {
      phases.add(rule.phase)
    }
  })
  
  // If no phase-specific rules, assume evaluation only
  return phases.size > 0 ? Array.from(phases) : ['evaluation']
}

export const hasScalingFeatures = (firmId: string, accountId: string): boolean => {
  const account = getAccountById(firmId, accountId)
  return account?.metadata?.hasScaling || false
}

export const getPayoutRequirements = (firmId: string, accountId: string): RuleTemplate | undefined => {
  const rules = getRulesForAccount(firmId, accountId)
  return rules.find(rule => rule.ruleType === 'payout_rule')
}

export const validateTradeAgainstRules = (
  firmId: string, 
  accountId: string, 
  tradeData: {
    dailyPnL: number
    positionSize: number
    accountBalance: number
    contractsCount: number
    totalProfit?: number
    tradingDays?: number
    largestWinningDay?: number
    phase?: 'evaluation' | 'funded'
    drawdownAmount?: number
    consecutiveTradingDays?: number
    averageProfitPerDay?: number
  },
  currentPhase: 'evaluation' | 'funded' = 'evaluation'
): { 
  isValid: boolean
  violations: Array<{ rule: string, message: string, severity: 'warning' | 'violation' }>
} => {
  const rules = getRulesForAccount(firmId, accountId)
  const violations: Array<{ rule: string, message: string, severity: 'warning' | 'violation' }> = []

  // Filter rules by current phase
  const phaseRules = rules.filter(rule => !rule.phase || rule.phase === currentPhase)

  phaseRules.forEach(rule => {
    switch (rule.ruleType) {
      case 'daily_loss':
        if (rule.maxValue && Math.abs(Math.min(0, tradeData.dailyPnL)) > rule.maxValue) {
          violations.push({
            rule: 'daily_loss',
            message: `Daily loss of $${Math.abs(tradeData.dailyPnL).toLocaleString()} exceeds limit of $${rule.maxValue.toLocaleString()}`,
            severity: 'violation'
          })
        } else if (rule.maxValue && Math.abs(Math.min(0, tradeData.dailyPnL)) > rule.maxValue * 0.8) {
          violations.push({
            rule: 'daily_loss',
            message: `Daily loss approaching limit (${((Math.abs(tradeData.dailyPnL) / rule.maxValue) * 100).toFixed(1)}% used)`,
            severity: 'warning'
          })
        }
        break

      case 'max_drawdown':
        if (rule.maxValue && tradeData.drawdownAmount && tradeData.drawdownAmount > rule.maxValue) {
          const drawdownMode = rule.drawdownMode === 'EOD' ? ' (End of Day)' : ''
          violations.push({
            rule: 'max_drawdown',
            message: `Drawdown of $${tradeData.drawdownAmount.toLocaleString()} exceeds limit of $${rule.maxValue.toLocaleString()}${drawdownMode}`,
            severity: 'violation'
          })
        } else if (rule.maxValue && tradeData.drawdownAmount && tradeData.drawdownAmount > rule.maxValue * 0.8) {
          violations.push({
            rule: 'max_drawdown',
            message: `Drawdown approaching limit (${((tradeData.drawdownAmount / rule.maxValue) * 100).toFixed(1)}% used)`,
            severity: 'warning'
          })
        }
        break

      case 'position_size':
        if (rule.percentage) {
          const positionPercentage = (tradeData.positionSize / tradeData.accountBalance) * 100
          if (positionPercentage > rule.percentage) {
            violations.push({
              rule: 'position_size',
              message: `Position size ${positionPercentage.toFixed(1)}% exceeds limit of ${rule.percentage}%`,
              severity: 'violation'
            })
          }
        }
        break

      case 'max_contracts':
        if (rule.maxValue && tradeData.contractsCount > rule.maxValue) {
          violations.push({
            rule: 'max_contracts',
            message: `Contract count ${tradeData.contractsCount} exceeds limit of ${rule.maxValue} (Phase: ${currentPhase})`,
            severity: 'violation'
          })
        }
        break

      case 'daily_drawdown':
        if (rule.enabled && tradeData.dailyPnL < 0) {
          // This would require additional logic based on specific drawdown calculation rules
          // For now, we'll provide a general check
          violations.push({
            rule: 'daily_drawdown',
            message: `Daily drawdown monitoring is active for ${currentPhase} phase`,
            severity: 'warning'
          })
        }
        break

      case 'consistency_rule':
        if (rule.percentage && tradeData.totalProfit && tradeData.largestWinningDay) {
          const consistencyPercentage = (tradeData.largestWinningDay / tradeData.totalProfit) * 100
          if (consistencyPercentage > rule.percentage) {
            violations.push({
              rule: 'consistency_rule',
              message: `Largest winning day (${consistencyPercentage.toFixed(1)}%) exceeds ${rule.percentage}% of total profit`,
              severity: 'violation'
            })
          }
        }
        break

      case 'profit_target':
        if (rule.maxValue && tradeData.totalProfit && tradeData.totalProfit >= rule.maxValue) {
          violations.push({
            rule: 'profit_target',
            message: `Profit target of $${rule.maxValue.toLocaleString()} reached! Ready to advance to ${currentPhase === 'evaluation' ? 'funded' : 'payout'} phase`,
            severity: 'warning'
          })
        }
        break

      case 'payout_rule':
        if (rule.payoutType === 'performance-based' && tradeData.consecutiveTradingDays && tradeData.averageProfitPerDay) {
          if (tradeData.consecutiveTradingDays >= (rule.minimumDays || 5)) {
            const eligibleForPayout = tradeData.averageProfitPerDay >= (rule.minimumProfitPerDay || 100)
            if (eligibleForPayout) {
              violations.push({
                rule: 'payout_rule',
                message: `Eligible for payout! ${tradeData.consecutiveTradingDays} trading days with $${tradeData.averageProfitPerDay.toFixed(2)}/day average`,
                severity: 'warning'
              })
            }
          }
        }
        break

      case 'micro_scaling':
        if (rule.ratio) {
          violations.push({
            rule: 'micro_scaling',
            message: `Micro scaling active at ${rule.ratio} ratio for ${currentPhase} phase`,
            severity: 'warning'
          })
        }
        break

      case 'scaling_rule':
        if (rule.enabled) {
          violations.push({
            rule: 'scaling_rule',
            message: `Account scaling rules are active for ${currentPhase} phase`,
            severity: 'warning'
          })
        }
        break
    }
  })

  return {
    isValid: violations.filter(v => v.severity === 'violation').length === 0,
    violations
  }
}

// Helper to get account difficulty badge color
export const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-success-100 text-success-700'
    case 'intermediate': return 'bg-blue-100 text-blue-700'
    case 'advanced': return 'bg-warning-100 text-warning-700'
    case 'expert': return 'bg-error-100 text-error-700'
    default: return 'bg-secondary-100 text-secondary-700'
  }
}

// Utility functions for structured Scale Plans
export const getStructuredRules = (firmId: string, accountId: string): StructuredScalePlan | undefined => {
  const account = getAccountById(firmId, accountId)
  return account?.structuredRules
}

export const isScalePlan = (firmId: string, accountId: string): boolean => {
  const structuredRules = getStructuredRules(firmId, accountId)
  return structuredRules?.planName === 'Scale'
}

export const getScalePlans = (firmId: string): PropFirmAccount[] => {
  const firm = getPropFirmById(firmId)
  return firm?.accounts.filter(account => account.structuredRules?.planName === 'Scale') || []
}

export const getAllScalePlans = (): StructuredScalePlan[] => {
  const scalePlans: StructuredScalePlan[] = []
  
  PROP_FIRMS.forEach(firm => {
    firm.accounts.forEach(account => {
      if (account.structuredRules?.planName === 'Scale') {
        scalePlans.push(account.structuredRules)
      }
    })
  })
  
  return scalePlans
}

export const isCorePlan = (firmId: string, accountId: string): boolean => {
  const structuredRules = getStructuredRules(firmId, accountId)
  return structuredRules?.planName === 'Core'
}

export const getCorePlans = (firmId: string): PropFirmAccount[] => {
  const firm = getPropFirmById(firmId)
  return firm?.accounts.filter(account => account.structuredRules?.planName === 'Core') || []
}

export const getAllCorePlans = (): StructuredScalePlan[] => {
  const corePlans: StructuredScalePlan[] = []
  
  PROP_FIRMS.forEach(firm => {
    firm.accounts.forEach(account => {
      if (account.structuredRules?.planName === 'Core') {
        corePlans.push(account.structuredRules)
      }
    })
  })
  
  return corePlans
}

export const getAllStructuredPlans = (): StructuredScalePlan[] => {
  const structuredPlans: StructuredScalePlan[] = []
  
  PROP_FIRMS.forEach(firm => {
    firm.accounts.forEach(account => {
      if (account.structuredRules) {
        structuredPlans.push(account.structuredRules)
      }
    })
  })
  
  return structuredPlans
}

export const isProPlan = (firmId: string, accountId: string): boolean => {
  const structuredRules = getStructuredRules(firmId, accountId)
  return structuredRules?.planName === 'Pro'
}

export const getProPlans = (firmId: string): PropFirmAccount[] => {
  const firm = getPropFirmById(firmId)
  return firm?.accounts.filter(account => account.structuredRules?.planName === 'Pro') || []
}

export const getAllProPlans = (): StructuredScalePlan[] => {
  const proPlans: StructuredScalePlan[] = []
  
  PROP_FIRMS.forEach(firm => {
    firm.accounts.forEach(account => {
      if (account.structuredRules?.planName === 'Pro') {
        proPlans.push(account.structuredRules)
      }
    })
  })
  
  return proPlans
}

export const validateAgainstStructuredRules = (
  firmId: string,
  accountId: string,
  tradeData: {
    dailyPnL: number
    totalProfit: number
    largestWinningDay: number
    contractsCount: number
    drawdownAmount: number
    consecutiveTradingDays: number
    averageProfitPerDay: number
  },
  currentPhase: 'evaluation' | 'funded' = 'evaluation'
): {
  isValid: boolean
  violations: Array<{ rule: string, message: string, severity: 'warning' | 'violation' }>
} => {
  const structuredRules = getStructuredRules(firmId, accountId)
  const violations: Array<{ rule: string, message: string, severity: 'warning' | 'violation' }> = []
  
  if (!structuredRules) {
    return { isValid: true, violations: [] }
  }

  // Parse numeric values from structured rules
  const parseValue = (value: string | number): number => {
    if (typeof value === 'number') return value
    return parseFloat(value.replace(/[$K,]/g, '')) * (value.includes('K') ? 1000 : 1)
  }

  // General Rules - Max Drawdown
  const maxDrawdown = parseValue(structuredRules.generalRules.maxDrawdown)
  if (tradeData.drawdownAmount > maxDrawdown) {
    violations.push({
      rule: 'max_drawdown',
      message: `Drawdown of $${tradeData.drawdownAmount.toLocaleString()} exceeds limit of $${maxDrawdown.toLocaleString()} (${structuredRules.generalRules.drawdownMode})`,
      severity: 'violation'
    })
  }

  // Phase-specific rules
  const phaseRules = currentPhase === 'evaluation' ? structuredRules.evaluationRules : structuredRules.fundedRules
  
  // Profit Target (evaluation only)
  if (currentPhase === 'evaluation') {
    const profitTarget = parseValue(structuredRules.evaluationRules.profitTarget)
    if (tradeData.totalProfit >= profitTarget) {
      violations.push({
        rule: 'profit_target',
        message: `Profit target of $${profitTarget.toLocaleString()} reached! Ready for funded phase`,
        severity: 'warning'
      })
    }
  }

  // Max Position (Contracts)
  const maxContracts = parseInt(phaseRules.maxPosition.toString().replace(/[^\d]/g, ''))
  if (tradeData.contractsCount > maxContracts) {
    violations.push({
      rule: 'max_contracts',
      message: `Contract count ${tradeData.contractsCount} exceeds limit of ${maxContracts} for ${currentPhase} phase`,
      severity: 'violation'
    })
  }

  // Consistency Rule
  if (currentPhase === 'evaluation' && typeof structuredRules.evaluationRules.consistencyRule === 'string') {
    const consistencyPercentage = parseFloat(structuredRules.evaluationRules.consistencyRule.replace('%', ''))
    const largestWinPercentage = (tradeData.largestWinningDay / tradeData.totalProfit) * 100
    
    if (largestWinPercentage > consistencyPercentage) {
      violations.push({
        rule: 'consistency_rule',
        message: `Largest winning day (${largestWinPercentage.toFixed(1)}%) exceeds ${consistencyPercentage}% consistency rule`,
        severity: 'violation'
      })
    }
  }

  // Payout Rules (funded phase)
  if (currentPhase === 'funded') {
    const payoutRules = structuredRules.payoutRules
    
    if (payoutRules.type === 'Time Based') {
      // Time-based payout logic
      const firstPayoutDays = payoutRules.firstPayout || 14
      if (tradeData.consecutiveTradingDays >= firstPayoutDays) {
        violations.push({
          rule: 'payout_eligible',
          message: `Eligible for time-based payout! ${tradeData.consecutiveTradingDays} days completed (first payout after ${firstPayoutDays} days)`,
          severity: 'warning'
        })
      }
    } else if (payoutRules.type === 'Performance Based' && payoutRules.minimumDays && payoutRules.minimumProfitPerDay) {
      // Performance-based payout logic
      const payoutMinDays = payoutRules.minimumDays
      const payoutMinProfitPerDay = parseValue(payoutRules.minimumProfitPerDay)
      
      if (tradeData.consecutiveTradingDays >= payoutMinDays && tradeData.averageProfitPerDay >= payoutMinProfitPerDay) {
        violations.push({
          rule: 'payout_eligible',
          message: `Eligible for performance-based payout! ${tradeData.consecutiveTradingDays} days with $${tradeData.averageProfitPerDay.toFixed(2)}/day average`,
          severity: 'warning'
        })
      }
    }
  }

  return {
    isValid: violations.filter(v => v.severity === 'violation').length === 0,
    violations
  }
}

export default PROP_FIRMS