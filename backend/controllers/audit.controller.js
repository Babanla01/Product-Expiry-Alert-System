const AuditLog = require('../models/AuditLog')

const getAuditLogs = async (req, res) => {
  try {
    const filter = {}
    if (req.query.entity) filter.entity = req.query.entity
    if (req.query.action) filter.action = req.query.action
    if (req.query.performedBy) filter.performedBy = req.query.performedBy

    if (req.query.from || req.query.to) {
      filter.createdAt = {}
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from)
      if (req.query.to) {
        const to = new Date(req.query.to)
        to.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = to
      }
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ])

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAuditLogs }