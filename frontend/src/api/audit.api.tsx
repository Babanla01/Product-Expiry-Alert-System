import api from './axios'
import type { AuditLog } from '../types'

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  page: number
  pages: number
}

export const getAuditLogsApi = async (params?: {
  entity?: string
  action?: string
  performedBy?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}): Promise<AuditLogsResponse> => {
  const res = await api.get('/audit', { params })
  return res.data
}