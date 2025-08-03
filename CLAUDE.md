# FundedSafe - Claude Development Context

This document provides context for Claude Code when working on the FundedSafe project.

## Project Overview

FundedSafe is a real-time compliance tracking platform for US futures traders built with:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Socket.io + Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Notifications**: Twilio + SendGrid

## Development Commands

```bash
# Frontend development
npm run dev                 # Start Next.js dev server (port 3000)
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking

# Backend development  
npm run server:dev         # Start Express server (port 3001)
npm run server:start       # Start production server

# Database operations
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:migrate        # Run migrations
npm run db:studio         # Open Prisma Studio
npm run db:seed           # Seed database with sample data

# Testing
npm test                  # Run Jest tests
npm run test:watch        # Watch mode
```

## Key File Locations

### Frontend Structure
- `app/` - Next.js 13+ app directory
- `components/ui/` - Reusable UI components (Button, Input, etc.)
- `components/layout/` - Layout components (DashboardLayout)
- `components/dashboard/` - Dashboard-specific components
- `lib/` - Utility libraries (auth.ts, stripe.ts)
- `contexts/` - React contexts (AuthContext, NotificationContext)

### Backend Structure
- `server/index.js` - Express server with Socket.io
- `server/routes/` - API route handlers
- `server/middleware/` - Custom middleware (auth, webhooks)
- `server/services/` - Business logic (compliance, notifications)

### Database
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Database seeding script

## Environment Variables

Required variables (see `.env.local.example`):
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication secret
- `STRIPE_SECRET_KEY` - Stripe integration
- `TWILIO_ACCOUNT_SID` - SMS notifications
- `SENDGRID_API_KEY` - Email notifications
- `TRADINGVIEW_WEBHOOK_SECRET` - Webhook security

## Common Tasks

### Adding New API Routes
1. Create route file in `app/api/` for Next.js API routes
2. Or add to `server/routes/` for Express routes
3. Update middleware as needed
4. Add TypeScript types in `types/index.ts`

### Adding New Components
1. Create component in appropriate `components/` subdirectory
2. Use existing UI components from `components/ui/`
3. Follow established patterns (use hooks, contexts)
4. Add tests in `__tests__/components/`

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Update TypeScript types if needed
4. Update seed data if applicable

### Testing
- Unit tests use Jest + Testing Library
- API tests mock database calls
- Component tests mock external dependencies
- Run tests before committing changes

## Integration Points

### TradingView Webhooks
- Endpoint: `/api/webhooks/tradingview`
- Requires signature verification
- Creates trades and triggers compliance checks

### Stripe Integration
- Checkout sessions for subscriptions
- Webhook handling for payment events
- Billing portal for customer management

### Real-time Features
- Socket.io server on port 3001
- Real-time trade updates
- Compliance alerts
- User-specific rooms

## Code Patterns

### Error Handling
```typescript
try {
  // API call or operation
} catch (error) {
  console.error('Specific error context:', error)
  // Handle gracefully, show user-friendly message
}
```

### API Response Format
```typescript
// Success
return NextResponse.json({ data, success: true })

// Error
return NextResponse.json(
  { error: 'Error message' }, 
  { status: 400 }
)
```

### Component Structure
```tsx
'use client' // if client component needed

import { useState, useEffect } from 'react'
// ... other imports

interface ComponentProps {
  // props definition
}

export default function Component({ props }: ComponentProps) {
  // component logic
  return (
    // JSX
  )
}
```

## Troubleshooting

### Common Issues
1. **Prisma Client Not Generated**: Run `npm run db:generate`
2. **Port Conflicts**: Check if ports 3000/3001 are available
3. **Environment Variables**: Ensure all required vars are set
4. **Database Connection**: Check PostgreSQL is running

### Debug Mode
- Enable verbose logging in development
- Check browser dev tools for client errors
- Monitor server logs for API issues
- Use Prisma Studio for database inspection

## Security Considerations

- Never commit secrets to version control
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication checks
- Verify webhook signatures
- Use HTTPS in production

## Performance Notes

- Database queries are optimized with proper indexes
- Use React.Suspense for loading states
- Implement pagination for large datasets
- Cache frequently accessed data
- Use Next.js Image optimization

This context should help Claude understand the project structure and make appropriate suggestions when working on FundedSafe.