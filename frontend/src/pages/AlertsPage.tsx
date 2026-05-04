import { useAlerts } from '../hooks/useAlerts'
import { exportAlertsCSV } from '../api/export.api'
import { useState } from 'react'

export default function AlertsPage() {
  const { alerts, loading, markAllRead } = useAlerts()
  const [exporting, setExporting] = useState(false)
  const unreadCount = alerts.filter((a) => !a.isRead).length

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAlertsCSV()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Alerts</h1>
            <p className="page-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              ↓ Export CSV
            </button>
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◬</div>
          <div className="empty-title">No alerts</div>
          <div className="empty-desc">All products are within safe expiry range</div>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`alert-item ${!alert.isRead ? 'unread' : ''} ${alert.type}`}
            >
              <div className={`alert-icon ${alert.type}`}>
                {alert.type === 'expired' ? '✕' : '◬'}
              </div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <span>
                    {typeof alert.product === 'object'
                      ? `Category: ${typeof alert.product.category === 'object' ? alert.product.category.name : '—'}`
                      : ''}
                  </span>
                  <span>
                    Expiry: {typeof alert.product === 'object' ? formatDate(alert.product.expiryDate) : '—'}
                  </span>
                  <span>{formatDate(alert.createdAt)} at {formatTime(alert.createdAt)}</span>
                </div>
              </div>
              <span
                className={`badge ${alert.type === 'expired' ? 'badge-expired' : 'badge-expiring'}`}
                style={{ flexShrink: 0 }}
              >
                {alert.type === 'expired' ? 'Expired' : 'Expiring Soon'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}