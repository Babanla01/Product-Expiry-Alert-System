const AuditLog = require('../models/AuditLog')

const logAction = async ({ action, entity, entityId, entityName, performedBy, changes }) => {
  try {
    await AuditLog.create({
      action, entity, entityId,
      entityName: entityName || '',
      performedBy,
      changes: changes || {},
    })
  } catch (error) {
    // Never crash the main operation if audit logging fails
    console.error('Audit log error:', error.message)
  }
}

module.exports = { logAction }