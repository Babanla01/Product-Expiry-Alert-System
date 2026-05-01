const express = require('express')
const router = express.Router()
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/product.controller')
const { protect } = require('../middleware/auth')
const { canEditProduct } = require('../middleware/canEditProduct')

router.use(protect)

router.get('/', getAllProducts)
router.post('/', createProduct)
router.get('/:id', getProductById)
router.put('/:id', canEditProduct, updateProduct)
router.delete('/:id', canEditProduct, deleteProduct)

module.exports = router