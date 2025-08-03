const crypto = require('crypto')

const verifyTradingViewWebhook = (req, res, next) => {
  const signature = req.headers['x-tradingview-signature']
  const secret = process.env.TRADINGVIEW_WEBHOOK_SECRET

  if (!signature || !secret) {
    return res.status(401).json({ error: 'Webhook signature required' })
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' })
  }

  next()
}

module.exports = { verifyTradingViewWebhook }