const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// Get all trades for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    res.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new trade
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      symbol,
      side,
      quantity,
      price,
      orderType,
      tradingViewId
    } = req.body

    const trade = await prisma.trade.create({
      data: {
        userId: req.user.userId,
        symbol,
        side,
        quantity,
        price,
        orderType,
        tradingViewId,
        status: 'open'
      }
    })

    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`user-${req.user.userId}`).emit('trade-created', trade)
    }

    res.status(201).json(trade)
  } catch (error) {
    console.error('Error creating trade:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update trade (close position)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, closePrice, pnl } = req.body

    const trade = await prisma.trade.update({
      where: {
        id,
        userId: req.user.userId
      },
      data: {
        status,
        closePrice,
        pnl,
        closedAt: status === 'closed' ? new Date() : null
      }
    })

    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`user-${req.user.userId}`).emit('trade-updated', trade)
    }

    res.json(trade)
  } catch (error) {
    console.error('Error updating trade:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get trade statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalTrades, dailyTrades, totalPnL, dailyPnL] = await Promise.all([
      prisma.trade.count({
        where: { userId }
      }),
      prisma.trade.count({
        where: {
          userId,
          createdAt: { gte: today }
        }
      }),
      prisma.trade.aggregate({
        where: {
          userId,
          status: 'closed'
        },
        _sum: { pnl: true }
      }),
      prisma.trade.aggregate({
        where: {
          userId,
          status: 'closed',
          createdAt: { gte: today }
        },
        _sum: { pnl: true }
      })
    ])

    res.json({
      totalTrades,
      dailyTrades,
      totalPnL: totalPnL._sum.pnl || 0,
      dailyPnL: dailyPnL._sum.pnl || 0
    })
  } catch (error) {
    console.error('Error fetching trade stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router