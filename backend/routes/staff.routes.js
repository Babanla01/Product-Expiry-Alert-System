const express = require('express')
const router = express.Router()
const {
  createStaff, getAllStaff, deactivateStaff, reactivateStaff, deleteStaff
} = require('../controllers/staff.controller')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/isAdmin')

router.use(protect, isAdmin)

router.get('/', getAllStaff)
router.post('/', createStaff)
router.patch('/:id/deactivate', deactivateStaff)
router.patch('/:id/reactivate', reactivateStaff)
router.delete('/:id', deleteStaff)

module.exports = router