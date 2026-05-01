const express = require('express')
const router = express.Router()
const { getAlerts, markAsRead } = require('../controllers/alert.controller')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/', getAlerts)
router.patch('/mark-read', markAsRead)

module.exports = router