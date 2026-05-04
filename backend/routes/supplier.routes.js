const express = require('express')
const router = express.Router()
const {
  createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier
} = require('../controllers/supplier.controller')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/isAdmin')

// All users can view suppliers (needed for product form dropdown)
router.get('/', protect, getAllSuppliers)
router.get('/:id', protect, getSupplierById)

// Only admin can create, update, delete
router.post('/', protect, isAdmin, createSupplier)
router.put('/:id', protect, isAdmin, updateSupplier)
router.delete('/:id', protect, isAdmin, deleteSupplier)

module.exports = router