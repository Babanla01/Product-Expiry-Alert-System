const Product = require('../models/Product')
const Alert = require('../models/Alert')

// Helper: convert array of objects to CSV string
const toCSV = (headers, rows) => {
  const headerRow = headers.join(',')
  const dataRows = rows.map((row) =>
    row.map((cell) => {
      const val = cell === null || cell === undefined ? '' : String(cell)
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const exportProductsCSV = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.category) filter.category = req.query.category

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('addedBy', 'name')
      .sort({ expiryDate: 1 })

    const headers = ['Name', 'Category', 'Quantity', 'Expiry Date', 'Status', 'Supplier', 'Added By', 'Created At']

    const rows = products.map((p) => [
      p.name,
      typeof p.category === 'object' ? p.category?.name : '',
      p.quantity,
      formatDate(p.expiryDate),
      p.status,
      p.supplier || '',
      typeof p.addedBy === 'object' ? p.addedBy?.name : '',
      formatDate(p.createdAt),
    ])

    const csv = toCSV(headers, rows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message })
  }
}

const exportAlertsCSV = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate({
        path: 'product',
        select: 'name expiryDate category',
        populate: { path: 'category', select: 'name' },
      })
      .sort({ createdAt: -1 })

    const headers = ['Product', 'Category', 'Alert Type', 'Message', 'Status', 'Expiry Date', 'Alert Date']

    const rows = alerts.map((a) => [
      typeof a.product === 'object' ? a.product?.name : '',
      typeof a.product === 'object' && typeof a.product?.category === 'object'
        ? a.product.category?.name : '',
      a.type,
      a.message,
      a.isRead ? 'Read' : 'Unread',
      typeof a.product === 'object' ? formatDate(a.product?.expiryDate) : '',
      formatDate(a.createdAt),
    ])

    const csv = toCSV(headers, rows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="alerts.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message })
  }
}

const exportProductsPDF = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.category) filter.category = req.query.category

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('addedBy', 'name')
      .sort({ expiryDate: 1 })

    const statusCounts = {
      total: products.length,
      valid: products.filter((p) => p.status === 'valid').length,
      expiring_soon: products.filter((p) => p.status === 'expiring_soon').length,
      expired: products.filter((p) => p.status === 'expired').length,
    }

    const rows = products.map((p) => `
      <tr class="${p.status}">
        <td>${p.name}</td>
        <td>${typeof p.category === 'object' ? p.category?.name : ''}</td>
        <td>${p.quantity}</td>
        <td>${formatDate(p.expiryDate)}</td>
        <td><span class="badge ${p.status}">${p.status.replace('_', ' ')}</span></td>
        <td>${p.supplier || '—'}</td>
        <td>${typeof p.addedBy === 'object' ? p.addedBy?.name : ''}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Products Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #f5a623; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { color: #f5a623; }
    .meta { text-align: right; color: #666; font-size: 12px; }
    .stats { display: flex; gap: 16px; margin-bottom: 28px; }
    .stat { flex: 1; padding: 14px; border-radius: 8px; border: 1px solid #e5e5e5; }
    .stat-val { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
    .stat.valid .stat-val { color: #2dbe6c; }
    .stat.expiring .stat-val { color: #f5a623; }
    .stat.expired .stat-val { color: #e8453c; }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; background: #f8f8f8; border-bottom: 1px solid #e5e5e5; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    tr:hover td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge.valid { background: #e6f9ef; color: #2dbe6c; }
    .badge.expiring_soon { background: #fff7e6; color: #f5a623; }
    .badge.expired { background: #fdecea; color: #e8453c; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; color: #aaa; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Expiry<span>Alert</span></div>
      <div style="color:#888;font-size:12px;margin-top:4px">Product Expiry Management</div>
    </div>
    <div class="meta">
      <div style="font-weight:600;margin-bottom:2px">Products Report</div>
      <div>Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      ${req.query.status ? `<div>Filter: ${req.query.status}</div>` : ''}
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-val">${statusCounts.total}</div>
      <div class="stat-lbl">Total Products</div>
    </div>
    <div class="stat valid">
      <div class="stat-val">${statusCounts.valid}</div>
      <div class="stat-lbl">Valid</div>
    </div>
    <div class="stat expiring">
      <div class="stat-val">${statusCounts.expiring_soon}</div>
      <div class="stat-lbl">Expiring Soon</div>
    </div>
    <div class="stat expired">
      <div class="stat-val">${statusCounts.expired}</div>
      <div class="stat-lbl">Expired</div>
    </div>
  </div>

  <h2>Product List</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Category</th>
        <th>Qty</th>
        <th>Expiry Date</th>
        <th>Status</th>
        <th>Supplier</th>
        <th>Added By</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">ExpiryAlert — Product Expiry Management System · ${new Date().getFullYear()}</div>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', 'attachment; filename="products-report.html"')
    res.send(html)
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message })
  }
}

module.exports = { exportProductsCSV, exportAlertsCSV, exportProductsPDF }