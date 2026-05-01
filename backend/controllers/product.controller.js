const Product = require('../models/Product')

const createProduct = async (req, res) => {
  try {
    const { name, quantity, category, expiryDate, supplier, description } = req.body

    if (!name || !quantity || !category || !expiryDate) {
      return res.status(400).json({ message: 'Name, quantity, category and expiry date are required' })
    }

    const product = await Product.create({
      name,
      quantity,
      category,
      expiryDate,
      supplier,
      description,
      addedBy: req.user._id,
    })

    await product.populate([
      { path: 'category', select: 'name' },
      { path: 'addedBy', select: 'name' },
    ])

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllProducts = async (req, res) => {
  try {
    const filter = {}

    if (req.query.category) filter.category = req.query.category
    if (req.query.status) filter.status = req.query.status

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('addedBy', 'name')
      .sort({ expiryDate: 1 })

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('addedBy', 'name')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    // req.product is attached by canEditProduct middleware
    const product = req.product
    const { name, quantity, category, expiryDate, supplier, description } = req.body

    if (name) product.name = name
    if (quantity !== undefined) product.quantity = quantity
    if (category) product.category = category
    if (expiryDate) product.expiryDate = expiryDate
    if (supplier !== undefined) product.supplier = supplier
    if (description !== undefined) product.description = description

    // Recalculate status after date update
    if (expiryDate) {
      const now = new Date()
      const expiry = new Date(expiryDate)
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      if (daysLeft < 0) product.status = 'expired'
      else if (daysLeft <= 7) product.status = 'expiring_soon'
      else product.status = 'valid'
    }

    await product.save()

    await product.populate([
      { path: 'category', select: 'name' },
      { path: 'addedBy', select: 'name' },
    ])

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = req.product
    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct }