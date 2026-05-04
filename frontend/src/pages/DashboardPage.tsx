import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDashboardStatsApi } from '../api/dashboard.api'
import { getAllProductsApi } from '../api/product.api'
import StatCard from '../components/StatCard'
import AlertBadge from '../components/AlertBadge'
import type { DashboardStats, Product } from '../types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const STATUS_COLOURS = {
  valid: '#2dbe6c',
  expiring_soon: '#f5a623',
  expired: '#e8453c',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatsApi(),
      getAllProductsApi({ status: 'expiring_soon' }),
      getAllProductsApi(),
    ]).then(([s, expiring, all]) => {
      setStats(s)
      setRecentProducts(expiring.slice(0, 5))
      setAllProducts(all)
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

  // Pie chart data
  const pieData = stats ? [
    { name: 'Valid', value: stats.valid, colour: STATUS_COLOURS.valid },
    { name: 'Expiring Soon', value: stats.expiringSoon, colour: STATUS_COLOURS.expiring_soon },
    { name: 'Expired', value: stats.expired, colour: STATUS_COLOURS.expired },
  ].filter(d => d.value > 0) : []

  // Bar chart — products expiring by week over next 4 weeks
  const getWeekLabel = (weekOffset: number) => {
    const start = new Date()
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
  }

  const barData = [0, 1, 2, 3].map(week => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() + week * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const count = allProducts.filter(p => {
      const expiry = new Date(p.expiryDate)
      return expiry >= weekStart && expiry < weekEnd
    }).length

    return { week: `Wk ${week + 1}`, label: getWeekLabel(week), count }
  })

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { label: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            {payload[0].payload.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
            {payload[0].value} products
          </div>
        </div>
      )
    }
    return null
  }

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

      {/* Charts row */}
      {stats && stats.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 16, marginBottom: 24 }}>

          {/* Pie chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Status Distribution</h2>
            </div>
            <div className="card-body" style={{ padding: '12px 20px 20px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.colour} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: d.colour }}>{d.name}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value} products</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.colour }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Products Expiring — Next 4 Weeks</h2>
            </div>
            <div className="card-body" style={{ padding: '12px 20px 20px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expiring soon table */}
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
                {recentProducts.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="td-mono">{typeof p.category === 'object' ? p.category.name : '—'}</td>
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