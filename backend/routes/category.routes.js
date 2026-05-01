const express = require('express')
const router = express.Router()
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/category.controller')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/isAdmin')

// All logged-in users can view categories (needed for product form dropdown)
router.get('/', protect, getAllCategories)

// Only admin can create, update, delete
router.post('/', protect, isAdmin, createCategory)
router.put('/:id', protect, isAdmin, updateCategory)
router.delete('/:id', protect, isAdmin, deleteCategory)

module.exports = router