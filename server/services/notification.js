const twilio = require('twilio')
const sgMail = require('@sendgrid/mail')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class NotificationService {
  constructor() {
    // Initialize Twilio
    this.twilioClient = process.env.TWILIO_ACCOUNT_SID ? 
      twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null

    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    }
  }

  async sendAlert(userId, alert) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return

      // Send email notification
      await this.sendEmailAlert(user.email, alert)

      // Send SMS for high severity alerts
      if (alert.severity === 'high' && user.phone) {
        await this.sendSMSAlert(user.phone, alert)
      }

      // Log notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'alert',
          title: alert.title,
          message: alert.message,
          channel: 'email',
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error sending alert:', error)
    }
  }

  async sendEmailAlert(email, alert) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping email')
      return
    }

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'alerts@fundedsafe.com',
      subject: `FundedSafe Alert: ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${alert.type === 'violation' ? '#DC2626' : '#D97706'};">
            ${alert.title}
          </h2>
          <p>${alert.message}</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Dashboard
            </a>
          </p>
          <hr style="margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated alert from FundedSafe. 
            To manage your notification preferences, visit your account settings.
          </p>
        </div>
      `,
    }

    try {
      await sgMail.send(msg)
      console.log('Email alert sent successfully')
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  async sendSMSAlert(phone, alert) {
    if (!this.twilioClient) {
      console.log('Twilio not configured, skipping SMS')
      return
    }

    const message = `FundedSafe Alert: ${alert.title}\n${alert.message}\nView details: ${process.env.NEXTAUTH_URL}/dashboard`

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      })
      console.log('SMS alert sent successfully')
    } catch (error) {
      console.error('Error sending SMS:', error)
    }
  }

  async sendWelcomeEmail(email, firstName) {
    if (!process.env.SENDGRID_API_KEY) return

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'welcome@fundedsafe.com',
      subject: 'Welcome to FundedSafe!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to FundedSafe, ${firstName}!</h2>
          <p>Thank you for joining FundedSafe, the premier compliance tracking platform for futures traders.</p>
          
          <h3>Getting Started:</h3>
          <ol>
            <li>Complete your profile setup</li>
            <li>Configure your compliance rules</li>
            <li>Connect your TradingView account</li>
            <li>Set up your notification preferences</li>
          </ol>
          
          <p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              Go to Dashboard
            </a>
          </p>
          
          <p>If you have any questions, our support team is here to help!</p>
        </div>
      `,
    }

    try {
      await sgMail.send(msg)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }

  async sendDailyReport(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [trades, alerts, complianceScore] = await Promise.all([
        prisma.trade.findMany({
          where: {
            userId,
            createdAt: { gte: today },
          },
        }),
        prisma.alert.findMany({
          where: {
            userId,
            createdAt: { gte: today },
          },
        }),
        require('./compliance').getComplianceScore(userId),
      ])

      const totalPnL = trades
        .filter(t => t.status === 'closed')
        .reduce((sum, t) => sum + (t.pnl || 0), 0)

      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'reports@fundedsafe.com',
        subject: 'FundedSafe Daily Trading Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Daily Trading Report - ${today.toDateString()}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">
                <h4>Trades Today</h4>
                <p style="font-size: 24px; margin: 0;">${trades.length}</p>
              </div>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">
                <h4>P&L Today</h4>
                <p style="font-size: 24px; margin: 0; color: ${totalPnL >= 0 ? '#10B981' : '#EF4444'};">
                  $${totalPnL.toFixed(2)}
                </p>
              </div>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">
                <h4>Compliance Score</h4>
                <p style="font-size: 24px; margin: 0; color: ${complianceScore >= 90 ? '#10B981' : complianceScore >= 70 ? '#D97706' : '#EF4444'};">
                  ${complianceScore}%
                </p>
              </div>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">
                <h4>Alerts Today</h4>
                <p style="font-size: 24px; margin: 0;">${alerts.length}</p>
              </div>
            </div>
            
            <p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                 style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Full Dashboard
              </a>
            </p>
          </div>
        `,
      }

      await sgMail.send(msg)
    } catch (error) {
      console.error('Error sending daily report:', error)
    }
  }
}

module.exports = new NotificationService()