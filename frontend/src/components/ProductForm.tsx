import { useState, useEffect, type FormEvent } from 'react'
import type { Product, Category } from '../types'

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onSubmit: (data: Partial<Product>) => Promise<void>
  onClose: () => void
}

export default function ProductForm({ product, categories, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '', quantity: '', category: '', expiryDate: '', supplier: '', description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      const catId = typeof product.category === 'object' ? product.category._id : product.category
      setForm({
        name: product.name,
        quantity: String(product.quantity),
        category: catId,
        expiryDate: product.expiryDate.slice(0, 10),
        supplier: product.supplier || '',
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
        expiryDate: form.expiryDate,
        supplier: form.supplier,
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Full Cream Milk"
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Supplier (optional)</label>
                <input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional notes..."
                style={{ resize: 'vertical' }}
              />
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