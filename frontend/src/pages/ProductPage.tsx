import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductTable from '../components/ProductTable'
import ProductForm from '../components/ProductForm'
import type { Product } from '../types'

export default function ProductsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [actionError, setActionError] = useState('')

  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts({
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  })
  const { categories } = useCategories()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget._id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setActionError(e.response?.data?.message || 'Failed to delete')
    }
  }

  const handleSubmit = async (data: Partial<Product>) => {
    if (editProduct) {
      await updateProduct(editProduct._id, data)
    } else {
      await createProduct(data)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{products.length} products in inventory</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditProduct(null); setShowForm(true) }}
          >
            + Add Product
          </button>
        </div>
      </div>

      {actionError && <div className="error-msg">{actionError}</div>}

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="valid">Valid</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {(search || statusFilter || categoryFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter('') }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : (
        <ProductTable
          products={filtered}
          onEdit={handleEdit}
          onDelete={(p) => setDeleteTarget(p)}
        />
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</strong>?
                This cannot be undone.
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