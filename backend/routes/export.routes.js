const express = require('express')
const router = express.Router()
const { exportProductsCSV, exportAlertsCSV, exportProductsPDF } = require('../controllers/export.controller')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/products/csv', exportProductsCSV)
router.get('/products/pdf', exportProductsPDF)
router.get('/alerts/csv', exportAlertsCSV)

module.exports = router