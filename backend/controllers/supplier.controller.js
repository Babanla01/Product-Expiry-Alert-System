const Supplier = require('../models/Supplier')
const { logAction } = require('../utils/audit')

const createSupplier = async (req, res) => {
  try {
    const { name, contactName, email, phone, address } = req.body
    if (!name) return res.status(400).json({ message: 'Supplier name is required' })
    const exists = await Supplier.findOne({ name: name.trim() })
    if (exists) return res.status(400).json({ message: 'Supplier already exists' })
    const supplier = await Supplier.create({
      name, contactName, email, phone, address, createdBy: req.user._id,
    })
    await logAction({
      action: 'SUPPLIER_CREATED', entity: 'Supplier',
      entityId: supplier._id, entityName: supplier.name,
      performedBy: req.user._id,
    })
    res.status(201).json(supplier)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate('createdBy', 'name').sort({ name: 1 })
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('createdBy', 'name')
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
    const before = { name: supplier.name, contactName: supplier.contactName, email: supplier.email }
    const { name, contactName, email, phone, address } = req.body
    if (name) supplier.name = name
    if (contactName !== undefined) supplier.contactName = contactName
    if (email !== undefined) supplier.email = email
    if (phone !== undefined) supplier.phone = phone
    if (address !== undefined) supplier.address = address
    await supplier.save()
    await logAction({
      action: 'SUPPLIER_UPDATED', entity: 'Supplier',
      entityId: supplier._id, entityName: supplier.name,
      performedBy: req.user._id,
      changes: { before, after: req.body },
    })
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
    await logAction({
      action: 'SUPPLIER_DELETED', entity: 'Supplier',
      entityId: supplier._id, entityName: supplier.name,
      performedBy: req.user._id,
    })
    await supplier.deleteOne()
    res.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier }