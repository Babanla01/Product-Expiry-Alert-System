const cron = require('node-cron')
const Product = require('../models/Product')
const Alert = require('../models/Alert')
const User = require('../models/User')
const { sendExpiryAlertEmail } = require('../utils/mailer')

const runExpiryCheck = async () => {
  try {
    console.log('Running expiry check...')

    const now = new Date()
    const products = await Product.find().populate('category', 'name')

    const newlyExpired = []
    const newlyExpiringSoon = []

    for (const product of products) {
      const expiry = new Date(product.expiryDate)
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      let newStatus = 'valid'
      let alertType = null

      if (daysLeft < 0) {
        newStatus = 'expired'
        alertType = 'expired'
      } else if (daysLeft <= 7) {
        newStatus = 'expiring_soon'
        alertType = 'expiring_soon'
      }

      if (product.status !== newStatus) {
        product.status = newStatus
        await product.save()
      }

      if (alertType) {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const existingAlert = await Alert.findOne({
          product: product._id,
          type: alertType,
          createdAt: { $gte: todayStart },
        })

        if (!existingAlert) {
          const message =
            alertType === 'expired'
              ? `${product.name} has expired`
              : `${product.name} is expiring in ${daysLeft} day(s)`

          await Alert.create({
            product: product._id,
            type: alertType,
            message,
          })

          const productData = {
            name: product.name,
            category: typeof product.category === 'object' ? product.category?.name : '',
            quantity: product.quantity,
            expiryDate: product.expiryDate,
          }

          if (alertType === 'expired') newlyExpired.push(productData)
          else newlyExpiringSoon.push(productData)
        }
      }
    }

    // Send emails if there are new alerts
    if (newlyExpired.length > 0 || newlyExpiringSoon.length > 0) {
      const allUsers = await User.find({ isActive: true }).select('email name')
      const emails = allUsers.map((u) => u.email).join(', ')

      if (process.env.EMAIL_USER && emails) {
        if (newlyExpired.length > 0) {
          await sendExpiryAlertEmail({
            to: emails,
            subject: `⚠ ExpiryAlert: ${newlyExpired.length} product(s) have expired`,
            products: newlyExpired,
            type: 'expired',
          }).catch((err) => console.error('Email send error (expired):', err.message))
        }

        if (newlyExpiringSoon.length > 0) {
          await sendExpiryAlertEmail({
            to: emails,
            subject: `⏰ ExpiryAlert: ${newlyExpiringSoon.length} product(s) expiring soon`,
            products: newlyExpiringSoon,
            type: 'expiring_soon',
          }).catch((err) => console.error('Email send error (expiring):', err.message))
        }
      }
    }

    console.log('Expiry check complete')
  } catch (error) {
    console.error('Expiry check error:', error.message)
  }
}

const expiryChecker = () => {
  cron.schedule('0 0 * * *', runExpiryCheck)
  runExpiryCheck()
}

module.exports = expiryChecker