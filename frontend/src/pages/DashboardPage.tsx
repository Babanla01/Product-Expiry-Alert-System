import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDashboardStatsApi } from '../api/dashboard.api'
import { getAllProductsApi } from '../api/product.api'
import StatCard from '../components/StatCard'
import AlertBadge from '../components/AlertBadge'
import type { DashboardStats, Product } from '../types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatsApi(),
      getAllProductsApi({ status: 'expiring_soon' }),
    ]).then(([s, products]) => {
      setStats(s)
      setRecentProducts(products.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const getDaysLeft = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    if (diff < 0) return `${Math.abs(diff)}d overdue`
    if (diff === 0) return 'Expires today'
    return `${diff} days left`
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle" style={{ marginBottom: 4 }}>
          {greeting}, <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
        </p>
        <h1 className="page-title">Dashboard</h1>
      </div>

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Products" value={stats.total} icon="◫" variant="total" />
          <StatCard label="Valid" value={stats.valid} icon="✓" variant="valid" />
          <StatCard label="Expiring Soon" value={stats.expiringSoon} icon="◬" variant="expiring" />
          <StatCard label="Expired" value={stats.expired} icon="✕" variant="expired" />
          <StatCard label="Unread Alerts" value={stats.unreadAlerts} icon="◉" variant="alerts" />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Expiring Soon</h2>
          <span className="badge badge-expiring">{recentProducts.length} items</span>
        </div>
        {recentProducts.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-icon">✓</div>
            <div className="empty-title">All clear!</div>
            <div className="empty-desc">No products expiring in the next 7 days</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Time Left</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="td-mono">
                      {typeof p.category === 'object' ? p.category.name : '—'}
                    </td>
                    <td className="td-mono">{p.quantity}</td>
                    <td className="td-mono">{formatDate(p.expiryDate)}</td>
                    <td><AlertBadge status={p.status} /></td>
                    <td style={{ color: 'var(--status-expiring)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {getDaysLeft(p.expiryDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}