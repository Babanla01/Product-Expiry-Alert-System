import api from './axios'
import type { DashboardStats } from '../types'

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard')
  return res.data
}