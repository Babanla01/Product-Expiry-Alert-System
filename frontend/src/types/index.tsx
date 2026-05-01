export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  isActive: boolean
  createdAt: string
}

export interface Category {
  _id: string
  name: string
  description: string
  createdBy: { _id: string; name: string }
  createdAt: string
}

export interface Product {
  _id: string
  name: string
  quantity: number
  category: Category | string
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  addedBy: { _id: string; name: string } | string
  supplier: string
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
  token: string
}