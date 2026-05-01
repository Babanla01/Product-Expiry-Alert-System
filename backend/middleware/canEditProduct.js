const Product = require('../models/Product')

const canEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = product.addedBy.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied, you can only edit your own products' })
    }

    req.product = product
    next()
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { canEditProduct }