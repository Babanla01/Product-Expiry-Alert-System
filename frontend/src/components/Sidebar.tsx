import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { getAlertsApi } from '../api/alert.api'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getAlertsApi({ isRead: false })
      .then(alerts => setUnreadCount(alerts.length))
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">⏱</div>
          <div>
            <div className="logo-text">ExpiryAlert</div>
            <div className="logo-sub">Inventory Manager</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">⊞</span>Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">◫</span>Products
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">◬</span>Alerts
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-section-label">Admin</div>
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="nav-icon">◈</span>Categories
            </NavLink>
            <NavLink to="/suppliers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="nav-icon">◉</span>Suppliers
            </NavLink>
            <NavLink to="/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="nav-icon">◎</span>Staff
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="nav-icon">◧</span>Audit Log
            </NavLink>
          </>
        )}

        <div className="nav-section-label">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <span className="nav-icon">◉</span>Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  )
}