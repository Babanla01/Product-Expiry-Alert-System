const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendExpiryAlertEmail = async ({ to, subject, products, type }) => {
  const statusLabel = type === 'expired' ? 'Expired' : 'Expiring Soon'
  const statusColor = type === 'expired' ? '#e8453c' : '#f5a623'

  const rows = products.map((p) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${p.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${p.category || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${p.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${new Date(p.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
        <span style="background:${type === 'expired' ? '#fdecea' : '#fff7e6'};color:${statusColor};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;">
          ${statusLabel}
        </span>
      </td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">

    <div style="background:#0f0f11;padding:24px 32px;display:flex;align-items:center;gap:12px;">
      <div style="background:#f5a623;width:36px;height:36px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;">⏱</div>
      <div>
        <div style="color:#f0ede8;font-size:18px;font-weight:800;letter-spacing:-0.3px;">Delight Supermarket</div>
        <div style="color:#9896a0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Inventory Manager</div>
      </div>
    </div>

    <div style="padding:32px;">
      <div style="background:${type === 'expired' ? '#fdecea' : '#fff7e6'};border:1px solid ${statusColor}40;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <div style="font-size:16px;font-weight:700;color:${statusColor};margin-bottom:4px;">
          ${type === 'expired' ? '⚠ Products Have Expired' : '⏰ Products Expiring Soon'}
        </div>
        <div style="font-size:13px;color:#555;">
          ${products.length} product${products.length > 1 ? 's' : ''} require${products.length === 1 ? 's' : ''} your attention.
          Please review and take appropriate action.
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#888;border-bottom:1px solid #e5e5e5;">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#888;border-bottom:1px solid #e5e5e5;">Category</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#888;border-bottom:1px solid #e5e5e5;">Qty</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#888;border-bottom:1px solid #e5e5e5;">Expiry Date</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#888;border-bottom:1px solid #e5e5e5;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <a href="http://localhost:5173/alerts" style="display:inline-block;background:#f5a623;color:#0f0f11;padding:11px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">
        View All Alerts →
      </a>
    </div>

    <div style="background:#f8f8f8;padding:16px 32px;text-align:center;color:#aaa;font-size:11px;border-top:1px solid #e5e5e5;">
      Delight Supermarket — Inventory & Expiry Management · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

module.exports = { sendExpiryAlertEmail }