const mongoose = require('mongoose')
const { resolveSupplierId } = require('../utils/supplierResolver')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: ['valid', 'expiring_soon', 'expired'],
      default: 'valid',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

productSchema.pre('save', async function (next) {
  try {
    if (this.isModified('supplier') || this.isNew) {
      const normalizedSupplier = await resolveSupplierId(this.supplier)
      if (normalizedSupplier && normalizedSupplier !== this.supplier) {
        this.supplier = normalizedSupplier
      } else if (this.supplier && typeof this.supplier === 'string') {
        this.supplier = null
      }
    }
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = mongoose.model('Product', productSchema)