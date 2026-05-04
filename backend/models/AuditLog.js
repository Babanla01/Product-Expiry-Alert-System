const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED',
        'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
        'SUPPLIER_CREATED', 'SUPPLIER_UPDATED', 'SUPPLIER_DELETED',
        'STAFF_CREATED', 'STAFF_DEACTIVATED', 'STAFF_REACTIVATED', 'STAFF_DELETED',
        'PASSWORD_CHANGED',
      ],
      required: true,
    },
    entity: {
      type: String,
      enum: ['Product', 'Category', 'Supplier', 'User'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityName: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('AuditLog', auditLogSchema)