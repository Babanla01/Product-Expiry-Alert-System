import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { changePasswordApi } from '../api/auth.api'

export default function ForceChangePasswordPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required'); return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters'); return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match'); return
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from your current password'); return
    }
    setLoading(true)
    try {
      await changePasswordApi(form.currentPassword, form.newPassword)
      // Update the stored user so mustChangePassword is false
      if (user) {
        login({ ...user, mustChangePassword: false })
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 440 }}>
        <div className="login-header">
          <div className="login-logo-wrap" style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}>
            🔒
          </div>
          <h1 className="login-title" style={{ fontSize: 20 }}>Set Your Password</h1>
          <p className="login-desc">
            Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>.
            Your admin has set a temporary password. Please set a new one before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label>Temporary Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Password given by your admin"
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}