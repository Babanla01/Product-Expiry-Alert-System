const Product = require('../models/Product')
const { logAction } = require('../utils/audit')

const createProduct = async (req, res) => {
  try {
    const { name, quantity, category, supplier, expiryDate, description } = req.body
    if (!name || !quantity || !category || !expiryDate) {
      return res.status(400).json({ message: 'Name, quantity, category and expiry date are required' })
    }
    const product = await Product.create({
      name, quantity, category,
      supplier: supplier || null,
      expiryDate, description,
      addedBy: req.user._id,
    })
    await product.populate([
      { path: 'category', select: 'name' },
      { path: 'supplier', select: 'name' },
      { path: 'addedBy', select: 'name' },
    ])
    await logAction({
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product._id,
      entityName: product.name,
      performedBy: req.user._id,
      changes: { name, quantity, category, expiryDate },
    })
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
    if (req.query.supplier) filter.supplier = req.query.supplier
    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name')
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
      .populate('supplier', 'name')
      .populate('addedBy', 'name')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = req.product
    const before = {
      name: product.name, quantity: product.quantity,
      expiryDate: product.expiryDate, status: product.status,
    }
    const { name, quantity, category, supplier, expiryDate, description } = req.body
    if (name) product.name = name
    if (quantity !== undefined) product.quantity = quantity
    if (category) product.category = category
    if (supplier !== undefined) product.supplier = supplier || null
    if (expiryDate) product.expiryDate = expiryDate
    if (description !== undefined) product.description = description
    if (expiryDate) {
      const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / 86400000)
      if (daysLeft < 0) product.status = 'expired'
      else if (daysLeft <= 7) product.status = 'expiring_soon'
      else product.status = 'valid'
    }
    await product.save()
    await product.populate([
      { path: 'category', select: 'name' },
      { path: 'supplier', select: 'name' },
      { path: 'addedBy', select: 'name' },
    ])
    await logAction({
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: product._id,
      entityName: product.name,
      performedBy: req.user._id,
      changes: { before, after: req.body },
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = req.product
    await logAction({
      action: 'PRODUCT_DELETED',
      entity: 'Product',
      entityId: product._id,
      entityName: product.name,
      performedBy: req.user._id,
    })
    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct }