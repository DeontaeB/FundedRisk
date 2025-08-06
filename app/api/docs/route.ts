import { NextResponse } from 'next/server'

export async function GET() {
  const documentation = {
    title: "PropRuleTracker API Documentation",
    version: "1.0.0",
    description: "Complete API reference for the PropRuleTracker trading compliance platform",
    baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    
    authentication: {
      description: "Most endpoints require authentication via NextAuth.js session",
      type: "Session-based",
      endpoints: {
        "POST /api/auth/signup": {
          description: "Create a new user account",
          body: {
            firstName: "string (required)",
            lastName: "string (required)", 
            email: "string (required, valid email)",
            password: "string (required, min 6 chars)"
          },
          responses: {
            201: "Account created successfully",
            400: "Validation error or email already exists"
          }
        },
        "GET /api/auth/session": {
          description: "Get current user session",
          responses: {
            200: "Session data or null if not authenticated"
          }
        }
      }
    },
    
    trades: {
      description: "Manage trading positions and history",
      endpoints: {
        "GET /api/trades": {
          description: "Get user's trades with pagination and filtering",
          auth: "Required",
          queryParams: {
            page: "number (default: 1)",
            limit: "number (default: 50, max: 100)",
            status: "string (open|closed|cancelled)",
            symbol: "string (filter by symbol)"
          },
          responses: {
            200: "Array of trades with pagination info",
            401: "Unauthorized"
          }
        },
        "POST /api/trades": {
          description: "Create a new trade",
          auth: "Required",
          body: {
            symbol: "string (required)",
            side: "enum (buy|sell, required)",
            quantity: "number (required, positive)",
            price: "number (required, positive)",
            closePrice: "number (optional, positive)",
            orderType: "enum (market|limit|stop, default: market)",
            status: "enum (open|closed|cancelled, default: open)",
            source: "enum (manual|tradingview|api, default: manual)",
            userTradingAccountId: "string (optional)"
          },
          responses: {
            201: "Trade created successfully",
            400: "Validation error",
            401: "Unauthorized"
          }
        },
        "GET /api/trades/[id]": {
          description: "Get specific trade by ID",
          auth: "Required",
          responses: {
            200: "Trade details with compliance checks",
            404: "Trade not found",
            401: "Unauthorized"
          }
        },
        "PATCH /api/trades/[id]": {
          description: "Update specific trade",
          auth: "Required",
          body: {
            closePrice: "number (optional)",
            status: "enum (optional)",
            quantity: "number (optional)",
            price: "number (optional)"
          },
          responses: {
            200: "Trade updated successfully",
            404: "Trade not found",
            400: "Validation error",
            401: "Unauthorized"
          }
        },
        "DELETE /api/trades/[id]": {
          description: "Delete specific trade",
          auth: "Required",
          responses: {
            200: "Trade deleted successfully",
            404: "Trade not found",
            401: "Unauthorized"
          }
        }
      }
    },
    
    compliance: {
      description: "Manage compliance rules and monitoring",
      endpoints: {
        "GET /api/compliance/rules": {
          description: "Get user's compliance rules",
          auth: "Required",
          queryParams: {
            active: "boolean (filter by active status)",
            type: "string (daily_loss|position_size|trading_hours|max_trades|max_drawdown)"
          },
          responses: {
            200: "Array of compliance rules with recent alerts",
            401: "Unauthorized"
          }
        },
        "POST /api/compliance/rules": {
          description: "Create a new compliance rule",
          auth: "Required",
          body: {
            name: "string (required, unique per user)",
            type: "enum (required: daily_loss|position_size|trading_hours|max_trades|max_drawdown)",
            threshold: "number (required, positive)",
            description: "string (optional)",
            isActive: "boolean (default: true)"
          },
          responses: {
            201: "Compliance rule created successfully",
            400: "Validation error or duplicate name",
            401: "Unauthorized"
          }
        },
        "GET /api/compliance/rules/[id]": {
          description: "Get specific compliance rule",
          auth: "Required",
          responses: {
            200: "Rule details with recent alerts",
            404: "Rule not found",
            401: "Unauthorized"
          }
        },
        "PATCH /api/compliance/rules/[id]": {
          description: "Update specific compliance rule",
          auth: "Required",
          body: {
            name: "string (optional)",
            threshold: "number (optional)",
            description: "string (optional)",
            isActive: "boolean (optional)"
          },
          responses: {
            200: "Rule updated successfully",
            404: "Rule not found",
            400: "Validation error",
            401: "Unauthorized"
          }
        },
        "DELETE /api/compliance/rules/[id]": {
          description: "Delete specific compliance rule",
          auth: "Required",
          responses: {
            200: "Rule deleted successfully",
            404: "Rule not found",
            401: "Unauthorized"
          }
        }
      }
    },
    
    alerts: {
      description: "Manage alerts and notifications",
      endpoints: {
        "GET /api/alerts": {
          description: "Get user's alerts with pagination and filtering",
          auth: "Required",
          queryParams: {
            page: "number (default: 1)",
            limit: "number (default: 50)",
            read: "boolean (filter by read status)",
            resolved: "boolean (filter by resolved status)",
            severity: "string (low|medium|high|critical)",
            type: "string (warning|violation|info)"
          },
          responses: {
            200: "Array of alerts with pagination info",
            401: "Unauthorized"
          }
        },
        "POST /api/alerts": {
          description: "Create a new alert",
          auth: "Required",
          body: {
            type: "enum (required: warning|violation|info)",
            title: "string (required)",
            message: "string (required)",
            severity: "enum (low|medium|high|critical, default: medium)",
            complianceRuleId: "string (optional)",
            metadata: "object (optional)"
          },
          responses: {
            201: "Alert created successfully",
            400: "Validation error",
            401: "Unauthorized"
          }
        },
        "PATCH /api/alerts/[id]": {
          description: "Update alert (mark as read/resolved)",
          auth: "Required",
          body: {
            isRead: "boolean (optional)",
            isResolved: "boolean (optional)"
          },
          responses: {
            200: "Alert updated successfully",
            404: "Alert not found",
            401: "Unauthorized"
          }
        }
      }
    },
    
    dashboard: {
      description: "Dashboard analytics and statistics",
      endpoints: {
        "GET /api/dashboard/stats": {
          description: "Get comprehensive dashboard statistics",
          auth: "Required",
          queryParams: {
            period: "number (days to include, default: 30)"
          },
          responses: {
            200: {
              description: "Dashboard statistics",
              data: {
                trading: "Trading statistics (total trades, P&L, win rate, etc.)",
                account: "Account information (balance, returns, etc.)",
                compliance: "Compliance status (alerts, rules, violations)",
                charts: "Chart data for visualizations",
                period: "Period information"
              }
            },
            401: "Unauthorized"
          }
        }
      }
    },
    
    testing: {
      description: "Development and testing endpoints",
      endpoints: {
        "GET /api/test/database": {
          description: "Test database connectivity",
          responses: {
            200: "Database connection successful with counts"
          }
        },
        "GET /api/test/session": {
          description: "Test session handling",
          responses: {
            200: "Session status and user info"
          }
        },
        "GET /api/test/api-health": {
          description: "Comprehensive API health check",
          responses: {
            200: "Health status of all services and endpoints list"
          }
        }
      }
    },
    
    webhooks: {
      description: "Webhook endpoints for external integrations",
      endpoints: {
        "POST /api/webhooks/secure/[token]": {
          description: "Secure webhook endpoint for TradingView alerts",
          auth: "Token-based (webhook URL)",
          body: "TradingView alert payload",
          responses: {
            200: "Webhook processed successfully",
            401: "Invalid token or signature",
            400: "Invalid payload"
          }
        },
        "POST /api/webhooks/tradingview": {
          description: "Legacy TradingView webhook endpoint",
          responses: {
            200: "Webhook processed"
          }
        },
        "POST /api/webhooks/stripe": {
          description: "Stripe payment webhook handler",
          responses: {
            200: "Webhook processed"
          }
        }
      }
    },
    
    errorCodes: {
      400: "Bad Request - Invalid input or validation error",
      401: "Unauthorized - Authentication required or invalid",
      404: "Not Found - Resource not found",
      500: "Internal Server Error - Server-side error"
    },
    
    dataTypes: {
      Trade: {
        id: "string (UUID)",
        userId: "string (UUID)",
        symbol: "string (e.g., 'ES', 'NQ')",
        side: "enum (buy|sell)",
        quantity: "number",
        price: "number", 
        closePrice: "number (nullable)",
        pnl: "number (nullable)",
        status: "enum (open|closed|cancelled)",
        orderType: "enum (market|limit|stop)",
        source: "enum (manual|tradingview|api)",
        createdAt: "ISO timestamp",
        closedAt: "ISO timestamp (nullable)"
      },
      ComplianceRule: {
        id: "string (UUID)",
        userId: "string (UUID)",
        name: "string (unique per user)",
        type: "enum (daily_loss|position_size|trading_hours|max_trades|max_drawdown)",
        threshold: "number",
        isActive: "boolean",
        description: "string (nullable)",
        createdAt: "ISO timestamp",
        updatedAt: "ISO timestamp"
      },
      Alert: {
        id: "string (UUID)",
        userId: "string (UUID)",
        type: "enum (warning|violation|info)",
        title: "string",
        message: "string",
        severity: "enum (low|medium|high|critical)",
        isRead: "boolean",
        isResolved: "boolean",
        createdAt: "ISO timestamp",
        resolvedAt: "ISO timestamp (nullable)"
      }
    }
  }

  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600'
    }
  })
}