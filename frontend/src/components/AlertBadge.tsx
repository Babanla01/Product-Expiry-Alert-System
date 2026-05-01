type StatusType = 'valid' | 'expiring_soon' | 'expired'

const labels: Record<StatusType, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
}

const classMap: Record<StatusType, string> = {
  valid: 'badge badge-valid',
  expiring_soon: 'badge badge-expiring',
  expired: 'badge badge-expired',
}

export default function AlertBadge({ status }: { status: StatusType }) {
  return <span className={classMap[status]}>{labels[status]}</span>
}