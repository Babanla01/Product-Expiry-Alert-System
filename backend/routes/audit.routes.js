const express = require('express')
const router = express.Router()
const { getAuditLogs } = require('../controllers/audit.controller')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/isAdmin')

router.get('/', protect, isAdmin, getAuditLogs)

module.exports = router