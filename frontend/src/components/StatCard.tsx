interface StatCardProps {
  label: string
  value: number
  icon: string
  variant: 'total' | 'valid' | 'expiring' | 'expired' | 'alerts'
}

export default function StatCard({ label, value, icon, variant }: StatCardProps) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}