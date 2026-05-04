import { useState, useEffect } from 'react'
import { getAllStaffApi, createStaffApi, deactivateStaffApi, reactivateStaffApi, deleteStaffApi } from '../api/staff.api'
import StaffForm from '../components/StaffForm'
import type { User } from '../types'

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllStaffApi()
      .then(setStaff)
      .catch(() => setError('Failed to load staff'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (data: { name: string; email: string; password: string }) => {
    const newStaff = await createStaffApi(data)
    setStaff(prev => [newStaff, ...prev])
  }

  const handleDeactivate = async (id: string) => {
    await deactivateStaffApi(id)
    setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: false } : s))
  }

  const handleReactivate = async (id: string) => {
    await reactivateStaffApi(id)
    setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: true } : s))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteStaffApi(deleteTarget._id)
    setStaff(prev => prev.filter(s => s._id !== deleteTarget._id))
    setDeleteTarget(null)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Staff</h1>
            <p className="page-subtitle">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Staff</button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : staff.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <div className="empty-title">No staff yet</div>
            <div className="empty-desc">Add staff members so they can manage products</div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: member.isActive ? 'var(--bg-elevated)' : 'var(--status-expired-bg)',
                          border: `1px solid ${member.isActive ? 'var(--border)' : 'rgba(232,69,60,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700,
                          color: member.isActive ? 'var(--text-secondary)' : 'var(--status-expired)',
                          flexShrink: 0,
                        }}>
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{member.name}</div>
                          {member.mustChangePassword && (
                            <div style={{ fontSize: 10, color: 'var(--status-expiring)', fontFamily: 'var(--font-mono)' }}>
                              Awaiting password change
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="td-mono" style={{ fontSize: 13 }}>{member.email}</td>
                    <td><span className={`badge badge-${member.role}`}>{member.role}</span></td>
                    <td>
                      <span className={`badge ${member.isActive ? 'badge-valid' : 'badge-expired'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="td-mono" style={{ fontSize: 12 }}>{formatDate(member.createdAt)}</td>
                    <td>
                      <div className="td-actions">
                        {member.isActive ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDeactivate(member._id)}>
                            Deactivate
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--status-valid)', borderColor: 'rgba(45,190,108,0.3)' }} onClick={() => handleReactivate(member._id)}>
                            Reactivate
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(member)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && <StaffForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Staff</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</strong>? This cannot be undone.
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