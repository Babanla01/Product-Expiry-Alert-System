import type { Product } from '../types'
import AlertBadge from './AlertBadge'
import { useAuth } from '../hooks/useAuth'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const { user, isAdmin } = useAuth()

  const canEdit = (product: Product) => {
    if (isAdmin) return true
    const addedById = typeof product.addedBy === 'object' ? product.addedBy._id : product.addedBy
    return addedById === user?._id
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })

  const getDaysLeft = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
    if (diff < 0) return `${Math.abs(diff)}d ago`
    if (diff === 0) return 'Today'
    return `${diff}d left`
  }

  if (products.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <div className="empty-title">No products found</div>
          <div className="empty-desc">Add a product or adjust your filters</div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Expiry Date</th>
              <th>Days Left</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{product.name}</div>
                  {product.supplier && (
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {typeof product.supplier === 'object' ? product.supplier.name : product.supplier}
                    </div>
                  )}
                </td>
                <td className="td-mono">
                  {typeof product.category === 'object' ? product.category.name : '—'}
                </td>
                <td className="td-mono">{product.quantity}</td>
                <td className="td-mono">{formatDate(product.expiryDate)}</td>
                <td>
                  <span
                    className="td-mono"
                    style={{
                      color:
                        product.status === 'expired'
                          ? 'var(--status-expired)'
                          : product.status === 'expiring_soon'
                          ? 'var(--status-expiring)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {getDaysLeft(product.expiryDate)}
                  </span>
                </td>
                <td><AlertBadge status={product.status} /></td>
                <td className="td-mono" style={{ fontSize: 12 }}>
                  {typeof product.addedBy === 'object' ? product.addedBy.name : '—'}
                </td>
                <td>
                  <div className="td-actions">
                    {canEdit(product) ? (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(product)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}