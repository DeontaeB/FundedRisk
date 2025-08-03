# FundedSafe

**Real-time compliance tracking platform for US futures traders**

FundedSafe helps futures traders maintain compliance with risk management rules through real-time monitoring, automated alerts, and seamless TradingView integration.

## 🚀 Features

- **Real-time Compliance Monitoring** - Track daily loss limits, position sizes, and trading hours
- **TradingView Integration** - Receive trade signals via webhooks
- **Automated Alerts** - Email and SMS notifications for rule violations
- **Payment Processing** - Stripe integration for subscription management
- **WebSocket Support** - Real-time updates and notifications
- **Responsive Dashboard** - Modern React/Next.js interface

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Express.js API server with Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Stripe for subscription billing
- **Notifications**: Twilio (SMS) and SendGrid (Email)
- **Deployment**: Vercel for frontend, AWS for backend

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Stripe account
- TradingView account (for webhook integration)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fundedsafe.git
   cd fundedsafe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   - Database connection string
   - NextAuth.js secret and URL
   - Stripe keys
   - Twilio credentials
   - SendGrid API key
   - TradingView webhook secret

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   # Frontend (Next.js)
   npm run dev

   # Backend (Express.js) - in a new terminal
   npm run server:dev
   ```

## 🚀 Quick Start

1. **Create an account** at `http://localhost:3000/auth/signup`
2. **Configure compliance rules** in the dashboard settings
3. **Set up TradingView webhooks** using the provided endpoint
4. **Subscribe to a plan** to unlock all features

## 📊 Usage

### Setting Up TradingView Webhooks

1. In TradingView, go to your alert settings
2. Set the webhook URL to: `https://yourdomain.com/api/webhooks/tradingview`
3. Include this JSON payload:
   ```json
   {
     "symbol": "{{ticker}}",
     "action": "{{strategy.order.action}}",
     "quantity": 1,
     "price": "{{close}}",
     "userId": "your-user-id",
     "timestamp": "{{time}}"
   }
   ```

### Compliance Rules

Configure rules in the dashboard:
- **Daily Loss Limit**: Maximum daily loss threshold
- **Position Size**: Maximum position as % of account
- **Trading Hours**: Allowed trading time windows
- **Max Trades**: Maximum number of daily trades

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐳 Docker Deployment

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Building for production**
   ```bash
   docker build -t fundedsafe .
   docker run -p 3000:3000 fundedsafe
   ```

## 🌐 Deployment

### Vercel (Recommended for Frontend)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard

### AWS (for Full-Stack)

1. Configure AWS credentials
2. Deploy using the GitHub Actions workflow
3. Set up RDS for PostgreSQL
4. Configure ECS/Fargate for containers

## 📁 Project Structure

```
fundedsafe/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── server/               # Express.js backend
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── services/        # Business logic
├── prisma/              # Database schema and migrations
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
└── __tests__/           # Test files
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | ⚠️ |
| `SENDGRID_API_KEY` | SendGrid API key | ⚠️ |
| `TRADINGVIEW_WEBHOOK_SECRET` | Webhook signature secret | ⚠️ |

### Database Schema

The application uses Prisma with PostgreSQL. Key models:
- `User` - User accounts and profiles
- `Trade` - Trading transactions
- `ComplianceRule` - Risk management rules
- `Alert` - Compliance violations and warnings
- `Subscription` - Billing and subscription data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Documentation

### TradingView Webhook Endpoint

**POST** `/api/webhooks/tradingview`

```json
{
  "symbol": "ES",
  "action": "buy",
  "quantity": 2,
  "price": 4750.25,
  "userId": "user-id",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Authentication

All API endpoints require authentication via NextAuth.js session or Bearer token.

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check your `DATABASE_URL` environment variable
   - Ensure PostgreSQL is running
   - Run `npx prisma migrate dev`

2. **TradingView webhooks not working**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Review server logs for errors

3. **Stripe payments failing**
   - Confirm Stripe keys are correct
   - Check webhook endpoint configuration
   - Verify test/live mode consistency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@fundedsafe.com
- 📖 Documentation: [docs.fundedsafe.com](https://docs.fundedsafe.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/fundedsafe/issues)

---

**Built with ❤️ for futures traders by traders**