import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import CategoryForm from '../components/CategoryForm'
import type { Category } from '../types'

export default function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (data: { name: string; description: string }) => {
    if (editCategory) {
      await updateCategory(editCategory._id, data)
    } else {
      await createCategory(data)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget._id)
      setDeleteTarget(null)
    } catch {
      setError('Cannot delete — category may be in use by products')
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
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">{categories.length} categories defined</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditCategory(null); setShowForm(true) }}
          >
            + Add Category
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No categories yet</div>
            <div className="empty-desc">Create categories to organise your products</div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {cat.description || <span className="text-muted">—</span>}
                    </td>
                    <td className="td-mono" style={{ fontSize: 12 }}>
                      {typeof cat.createdBy === 'object' ? cat.createdBy.name : '—'}
                    </td>
                    <td className="td-mono" style={{ fontSize: 12 }}>{formatDate(cat.createdAt)}</td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setEditCategory(cat); setShowForm(true) }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(cat)}
                        >
                          Delete
                        </button>
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
        <CategoryForm
          category={editCategory}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditCategory(null) }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Category</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</strong>?
                Products using this category will lose their category reference.
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