import { useState, useEffect, type FormEvent } from 'react'
import type { Supplier } from '../types'

interface SupplierFormProps {
  supplier?: Supplier | null
  onSubmit: (data: { name: string; contactName: string; email: string; phone: string; address: string }) => Promise<void>
  onClose: () => void
}

export default function SupplierForm({ supplier, onSubmit, onClose }: SupplierFormProps) {
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
      })
    }
  }, [supplier])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name) { setError('Supplier name is required'); return }
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>Supplier Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. FreshFarm Dairy" />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Contact Person</label>
                <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@supplier.com" />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" />
              </div>
              <div className="input-group">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, Country" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : supplier ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}