const mongoose = require('mongoose')
const Supplier = require('../models/Supplier')

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resolveSupplierId = async (supplier, SupplierModel = Supplier, createdBy = null) => {
  if (!supplier) return null

  if (supplier && typeof supplier === 'object' && supplier._id) {
    return supplier._id
  }

  if (supplier instanceof mongoose.Types.ObjectId || mongoose.isValidObjectId(supplier)) {
    return supplier
  }

  if (supplier instanceof String || typeof supplier === 'string') {
    const trimmed = supplier.toString().trim()
    if (!trimmed) return null

    let supplierDoc = await SupplierModel.findOne({
      name: { $regex: `^${escapeRegExp(trimmed)}$`, $options: 'i' },
    })

    if (!supplierDoc) {
      const ownerId = createdBy || new mongoose.Types.ObjectId()
      supplierDoc = await SupplierModel.create({
        name: trimmed,
        createdBy: ownerId,
      })
    }

    return supplierDoc._id
  }

  return supplier
}

module.exports = { resolveSupplierId }
