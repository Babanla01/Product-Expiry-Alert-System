import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-logo">Expiry<span>Alert</span></div>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
        </div>
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}