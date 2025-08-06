import { NotificationRequest } from './sender'

// Email service interface - can be implemented with different providers
export interface EmailProvider {
  send(request: EmailRequest): Promise<EmailResult>
}

export interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// SendGrid implementation
export class SendGridEmailService implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string = 'alerts@fundedsafe.com') {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async send(request: EmailRequest): Promise<EmailResult> {
    try {
      // In production, you would use the actual SendGrid SDK
      // For now, we'll simulate the API call
      
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured')
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: request.to }],
            subject: request.subject
          }],
          from: { email: request.from || this.fromEmail },
          content: [
            {
              type: 'text/html',
              value: request.html
            },
            ...(request.text ? [{
              type: 'text/plain',
              value: request.text
            }] : [])
          ]
        })
      })

      if (response.ok) {
        return {
          success: true,
          messageId: response.headers.get('x-message-id') || undefined
        }
      } else {
        const errorText = await response.text()
        return {
          success: false,
          error: `SendGrid API error: ${response.status} - ${errorText}`
        }
      }

    } catch (error) {
      console.error('SendGrid email error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      }
    }
  }
}

// Mock/Development email service
export class MockEmailService implements EmailProvider {
  async send(request: EmailRequest): Promise<EmailResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('📧 [MOCK EMAIL SERVICE]')
    console.log('To:', request.to)
    console.log('Subject:', request.subject)
    console.log('From:', request.from)
    console.log('HTML Length:', request.html.length)
    if (request.text) {
      console.log('Text:', request.text.substring(0, 100) + '...')
    }
    console.log('---')

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }
  }
}

// Email template builder
export class EmailTemplateBuilder {
  static buildComplianceAlert(notification: NotificationRequest): EmailRequest {
    const severity = notification.severity
    const isViolation = severity === 'critical' || severity === 'major'
    
    const severityColors = {
      info: '#3B82F6',
      warning: '#F59E0B', 
      minor: '#EF4444',
      major: '#DC2626',
      critical: '#991B1B'
    }

    const severityEmojis = {
      info: 'ℹ️',
      warning: '⚠️',
      minor: '🔶',
      major: '🔴',
      critical: '🚨'
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
            color: #333;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .header { 
            background: linear-gradient(135deg, ${severityColors[severity]}, ${severityColors[severity]}dd);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .content { 
            padding: 30px; 
            line-height: 1.6;
          }
          .alert-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            border-radius: 20px; 
            background: ${severityColors[severity]}; 
            color: white; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            margin-bottom: 20px;
          }
          .message-box {
            background: #f8f9fa;
            border-left: 4px solid ${severityColors[severity]};
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .action-box {
            background: ${isViolation ? '#fef2f2' : '#f0f9ff'};
            border: 1px solid ${isViolation ? '#fecaca' : '#bae6fd'};
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .action-box h3 {
            margin: 0 0 15px 0;
            color: ${isViolation ? '#dc2626' : '#0369a1'};
            font-size: 16px;
          }
          .action-list {
            margin: 0;
            padding-left: 20px;
            color: #555;
          }
          .action-list li {
            margin-bottom: 8px;
          }
          .metadata {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            font-size: 14px;
            color: #666;
            margin-top: 20px;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
          .footer a {
            color: ${severityColors[severity]};
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .cta-button {
            display: inline-block;
            background: ${severityColors[severity]};
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>${severityEmojis[severity]}</span>
              FundedSafe Alert
            </h1>
          </div>
          <div class="content">
            <div class="alert-badge">${severity} Alert</div>
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">${notification.title}</h2>
            
            <div class="message-box">
              ${notification.message.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
            </div>

            <div class="action-box">
              <h3>${isViolation ? '🚨 Immediate Action Required' : '📋 Recommended Actions'}</h3>
              <ul class="action-list">
                ${isViolation ? `
                  <li><strong>Stop trading immediately</strong> to prevent further violations</li>
                  <li>Review your current positions and risk exposure</li>
                  <li>Contact your prop firm if needed</li>
                  <li>Adjust your trading strategy before resuming</li>
                ` : `
                  <li>Review your trading strategy and position sizing</li>
                  <li>Check your account dashboard for details</li>
                  <li>Monitor your risk parameters closely</li>
                  <li>Consider adjusting your settings if needed</li>
                `}
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
                View Dashboard
              </a>
            </div>

            ${notification.metadata ? `
              <div class="metadata">
                <strong>Event Details:</strong><br>
                ${notification.metadata.symbol ? `Symbol: ${notification.metadata.symbol}<br>` : ''}
                ${notification.metadata.action ? `Action: ${notification.metadata.action}<br>` : ''}
                ${notification.metadata.ruleViolations ? `Rule Violations: ${notification.metadata.ruleViolations}<br>` : ''}
                Event ID: ${notification.metadata.webhookEventId || 'N/A'}
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p><strong>FundedSafe</strong> - Protecting Your Prop Firm Account</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL}/settings/notifications">Manage Notifications</a> | 
              <a href="${process.env.NEXTAUTH_URL}/support">Get Support</a>
            </p>
            <p style="margin-top: 15px; font-size: 11px;">
              If you didn't expect this alert, please <a href="${process.env.NEXTAUTH_URL}/support">contact support</a> immediately.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Plain text version
    const text = `
FundedSafe Alert: ${notification.title}

${notification.message}

${isViolation ? 'IMMEDIATE ACTION REQUIRED:' : 'Recommended Actions:'}
${isViolation ? 
  '- Stop trading immediately to prevent further violations\n- Review your current positions and risk exposure\n- Contact your prop firm if needed' :
  '- Review your trading strategy\n- Check your dashboard for details\n- Monitor your risk parameters'
}

View your dashboard: ${process.env.NEXTAUTH_URL}/dashboard

---
FundedSafe - Protecting Your Prop Firm Account
    `.trim()

    return {
      to: '', // Will be filled by caller
      subject: `${severityEmojis[severity]} ${notification.title}`,
      html,
      text,
      from: 'FundedSafe Alerts <alerts@fundedsafe.com>'
    }
  }

  static buildWelcomeEmail(userEmail: string, userName: string): EmailRequest {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FundedSafe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🛡️ Welcome to FundedSafe!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Prop Firm Trading Compliance Partner</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #6366f1; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p>Thank you for joining FundedSafe! You're now protected with real-time compliance monitoring for your prop firm trading accounts.</p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin: 0 0 15px 0; color: #0369a1;">🚀 Get Started in 3 Easy Steps:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Set up your trading account</strong> - Connect your prop firm account details</li>
              <li style="margin-bottom: 10px;"><strong>Configure your webhook</strong> - Get real-time alerts from TradingView</li>
              <li style="margin-bottom: 10px;"><strong>Start trading safely</strong> - Receive instant compliance alerts</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/onboarding" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Complete Setup →
            </a>
          </div>

          <div style="background: #fef7ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #7c3aed;">💡 Pro Tips:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 8px;">Enable SMS alerts for critical violations</li>
              <li style="margin-bottom: 8px;">Test your webhook configuration regularly</li>
              <li style="margin-bottom: 8px;">Review your compliance rules monthly</li>
              <li>Keep your contact information updated</li>
            </ul>
          </div>

          <p>If you have any questions, our support team is here to help!</p>
          
          <p style="margin-bottom: 0;">
            Best regards,<br>
            <strong>The FundedSafe Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #6366f1;">Dashboard</a> | 
            <a href="${process.env.NEXTAUTH_URL}/support" style="color: #6366f1;">Support</a> | 
            <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #6366f1;">Notification Settings</a>
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
Welcome to FundedSafe!

Hi ${userName}!

Thank you for joining FundedSafe! You're now protected with real-time compliance monitoring for your prop firm trading accounts.

Get Started in 3 Easy Steps:
1. Set up your trading account - Connect your prop firm account details
2. Configure your webhook - Get real-time alerts from TradingView  
3. Start trading safely - Receive instant compliance alerts

Complete your setup: ${process.env.NEXTAUTH_URL}/onboarding

Pro Tips:
- Enable SMS alerts for critical violations
- Test your webhook configuration regularly
- Review your compliance rules monthly
- Keep your contact information updated

If you have any questions, our support team is here to help!

Best regards,
The FundedSafe Team

Dashboard: ${process.env.NEXTAUTH_URL}/dashboard
Support: ${process.env.NEXTAUTH_URL}/support
    `.trim()

    return {
      to: userEmail,
      subject: '🛡️ Welcome to FundedSafe - Your Trading Compliance Partner',
      html,
      text,
      from: 'FundedSafe Team <welcome@fundedsafe.com>'
    }
  }
}

// Factory function to create email service based on environment
export function createEmailService(): EmailProvider {
  const apiKey = process.env.SENDGRID_API_KEY
  
  if (apiKey && process.env.NODE_ENV === 'production') {
    return new SendGridEmailService(apiKey)
  } else {
    return new MockEmailService()
  }
}