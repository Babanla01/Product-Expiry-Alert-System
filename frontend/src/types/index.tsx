export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
}

export interface Category {
  _id: string
  name: string
  description: string
  createdBy: { _id: string; name: string }
  createdAt: string
}

export interface Supplier {
  _id: string
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  createdBy: { _id: string; name: string }
  createdAt: string
}

export interface Product {
  _id: string
  name: string
  quantity: number
  category: Category | string
  supplier: Supplier | string | null
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  addedBy: { _id: string; name: string } | string
  description: string
  createdAt: string
}

export interface Alert {
  _id: string
  product: {
    _id: string
    name: string
    expiryDate: string
    category: { _id: string; name: string }
  }
  type: 'expiring_soon' | 'expired'
  message: string
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  total: number
  valid: number
  expiringSoon: number
  expired: number
  unreadAlerts: number
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  mustChangePassword: boolean
  token: string
}

export interface AuditLog {
  _id: string
  action: string
  entity: string
  entityId: string
  entityName: string
  performedBy: { _id: string; name: string; role: string }
  changes: Record<string, unknown>
  createdAt: string
}