import { useState, useEffect } from 'react'
import { getAuditLogsApi } from '../api/audit.api'
import type { AuditLog } from '../types'

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_CREATED: 'Created product',
  PRODUCT_UPDATED: 'Updated product',
  PRODUCT_DELETED: 'Deleted product',
  CATEGORY_CREATED: 'Created category',
  CATEGORY_UPDATED: 'Updated category',
  CATEGORY_DELETED: 'Deleted category',
  SUPPLIER_CREATED: 'Created supplier',
  SUPPLIER_UPDATED: 'Updated supplier',
  SUPPLIER_DELETED: 'Deleted supplier',
  STAFF_CREATED: 'Created staff',
  STAFF_DEACTIVATED: 'Deactivated staff',
  STAFF_REACTIVATED: 'Reactivated staff',
  STAFF_DELETED: 'Deleted staff',
  PASSWORD_CHANGED: 'Changed password',
}

const ACTION_COLOURS: Record<string, string> = {
  PRODUCT_CREATED: 'var(--status-valid)',
  PRODUCT_UPDATED: 'var(--accent)',
  PRODUCT_DELETED: 'var(--status-expired)',
  CATEGORY_CREATED: 'var(--status-valid)',
  CATEGORY_UPDATED: 'var(--accent)',
  CATEGORY_DELETED: 'var(--status-expired)',
  SUPPLIER_CREATED: 'var(--status-valid)',
  SUPPLIER_UPDATED: 'var(--accent)',
  SUPPLIER_DELETED: 'var(--status-expired)',
  STAFF_CREATED: 'var(--status-valid)',
  STAFF_DEACTIVATED: 'var(--status-expiring)',
  STAFF_REACTIVATED: 'var(--status-valid)',
  STAFF_DELETED: 'var(--status-expired)',
  PASSWORD_CHANGED: 'var(--text-secondary)',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState('')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')

  const fetchLogs = async (p = 1) => {
    setLoading(true)
    try {
      const res = await getAuditLogsApi({
        entity: entityFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
        page: p,
        limit: 50,
      })
      setLogs(res.logs)
      setTotal(res.total)
      setPage(res.page)
      setPages(res.pages)
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs(1) }, [entityFilter, fromFilter, toFilter])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Audit Log</h1>
            <p className="page-subtitle">{total} total records</p>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <select className="filter-select" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
            <option value="">All Entities</option>
            <option value="Product">Products</option>
            <option value="Category">Categories</option>
            <option value="Supplier">Suppliers</option>
            <option value="User">Users</option>
          </select>
          <div className="input-group" style={{ margin: 0 }}>
            <input
              type="date"
              value={fromFilter}
              onChange={e => setFromFilter(e.target.value)}
              style={{ minWidth: 140 }}
              title="From date"
            />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <input
              type="date"
              value={toFilter}
              onChange={e => setToFilter(e.target.value)}
              style={{ minWidth: 140 }}
              title="To date"
            />
          </div>
        </div>
        {(entityFilter || fromFilter || toFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setEntityFilter(''); setFromFilter(''); setToFilter('') }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No audit records</div>
            <div className="empty-desc">Actions will appear here as users interact with the system</div>
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Item</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td>
                        <div className="td-mono" style={{ fontSize: 12 }}>{formatDate(log.createdAt)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {formatTime(log.createdAt)}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
                          color: ACTION_COLOURS[log.action] || 'var(--text-secondary)',
                        }}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-staff" style={{ fontSize: 10 }}>
                          {log.entity}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{log.entityName || <span className="text-muted">—</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0,
                          }}>
                            {log.performedBy?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{log.performedBy?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {log.performedBy?.role}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => fetchLogs(page - 1)} disabled={page === 1}>
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                Page {page} of {pages}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => fetchLogs(page + 1)} disabled={page === pages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}