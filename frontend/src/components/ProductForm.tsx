import { useState, useEffect, type FormEvent } from 'react'
import type { Product, Category, Supplier } from '../types'

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  suppliers: Supplier[]
  onSubmit: (data: Partial<Product>) => Promise<void>
  onClose: () => void
}

export default function ProductForm({ product, categories, suppliers, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '', quantity: '', category: '', supplier: '', expiryDate: '', description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      const catId = typeof product.category === 'object' ? product.category._id : product.category
      const supId = product.supplier
        ? typeof product.supplier === 'object' ? product.supplier._id : product.supplier
        : ''
      setForm({
        name: product.name,
        quantity: String(product.quantity),
        category: catId,
        supplier: supId,
        expiryDate: product.expiryDate.slice(0, 10),
        description: product.description || '',
      })
    }
  }, [product])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.quantity || !form.category || !form.expiryDate) {
      setError('Name, quantity, category and expiry date are required')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name,
        quantity: Number(form.quantity),
        category: form.category,
        supplier: form.supplier || undefined,
        expiryDate: form.expiryDate,
        description: form.description,
      })
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Full Cream Milk" />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Quantity *</label>
                <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="input-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Expiry Date *</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Supplier (optional)</label>
                <select value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Description (optional)</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional notes..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}