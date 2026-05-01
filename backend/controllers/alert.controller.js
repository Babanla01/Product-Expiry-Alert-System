const Alert = require('../models/Alert')

const getAlerts = async (req, res) => {
  try {
    const filter = {}
    if (req.query.type) filter.type = req.query.type
    if (req.query.isRead) filter.isRead = req.query.isRead === 'true'

    const alerts = await Alert.find(filter)
      .populate({
        path: 'product',
        select: 'name expiryDate category',
        populate: { path: 'category', select: 'name' },
      })
      .sort({ createdAt: -1 })

    res.json(alerts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const markAsRead = async (req, res) => {
  try {
    await Alert.updateMany({}, { isRead: true })
    res.json({ message: 'All alerts marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAlerts, markAsRead }