const Product = require('../models/Product')
const Alert = require('../models/Alert')

const getDashboardStats = async (req, res) => {
  try {
    const [total, valid, expiringSoon, expired, unreadAlerts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'valid' }),
      Product.countDocuments({ status: 'expiring_soon' }),
      Product.countDocuments({ status: 'expired' }),
      Alert.countDocuments({ isRead: false }),
    ])

    res.json({ total, valid, expiringSoon, expired, unreadAlerts })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getDashboardStats }