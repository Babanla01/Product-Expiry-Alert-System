import { useState, useEffect } from 'react'
import { getAlertsApi, markAlertsReadApi } from '../api/alert.api'
import type { Alert } from '../types'

export const useAlerts = (params?: { type?: string; isRead?: boolean }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const data = await getAlertsApi(params)
      setAlerts(data)
    } catch {
      setError('Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlerts() }, [])

  const markAllRead = async () => {
    await markAlertsReadApi()
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
  }

  return { alerts, loading, error, refetch: fetchAlerts, markAllRead }
}