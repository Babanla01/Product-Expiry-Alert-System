import api from './axios'
import type { Alert } from '../types'

export const getAlertsApi = async (params?: {
  type?: string
  isRead?: boolean
}): Promise<Alert[]> => {
  const res = await api.get('/alerts', { params })
  return res.data
}

export const markAlertsReadApi = async () => {
  const res = await api.patch('/alerts/mark-read')
  return res.data
}