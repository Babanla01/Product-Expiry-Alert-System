import { useState } from 'react'
import { useSuppliers } from '../hooks/useSuppliers'
import SupplierForm from '../components/SupplierForm'
import type { Supplier } from '../types'

export default function SuppliersPage() {
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (data: { name: string; contactName: string; email: string; phone: string; address: string }) => {
    if (editSupplier) await updateSupplier(editSupplier._id, data)
    else await createSupplier(data)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSupplier(deleteTarget._id)
      setDeleteTarget(null)
    } catch {
      setError('Cannot delete — supplier may be linked to products')
      setDeleteTarget(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Suppliers</h1>
            <p className="page-subtitle">{suppliers.length} suppliers registered</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditSupplier(null); setShowForm(true) }}>
            + Add Supplier
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : suppliers.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <div className="empty-title">No suppliers yet</div>
            <div className="empty-desc">Add suppliers to link them to your products</div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.contactName || <span className="text-muted">—</span>}</td>
                    <td className="td-mono" style={{ fontSize: 12 }}>{s.email || <span className="text-muted">—</span>}</td>
                    <td className="td-mono" style={{ fontSize: 12 }}>{s.phone || <span className="text-muted">—</span>}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.address || <span className="text-muted">—</span>}</td>
                    <td className="td-mono" style={{ fontSize: 12 }}>{formatDate(s.createdAt)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditSupplier(s); setShowForm(true) }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <SupplierForm
          supplier={editSupplier}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditSupplier(null) }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Supplier</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</strong>?
                Products linked to this supplier will lose the supplier reference.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}