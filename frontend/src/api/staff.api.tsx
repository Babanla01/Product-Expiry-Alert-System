import api from './axios'
import type { User } from '../types'

export const getAllStaffApi = async (): Promise<User[]> => {
  const res = await api.get('/staff')
  return res.data
}

export const createStaffApi = async (data: { name: string; email: string; password: string }): Promise<User> => {
  const res = await api.post('/staff', data)
  return res.data
}

export const deactivateStaffApi = async (id: string) => {
  const res = await api.patch(`/staff/${id}/deactivate`)
  return res.data
}

export const reactivateStaffApi = async (id: string) => {
  const res = await api.patch(`/staff/${id}/reactivate`)
  return res.data
}

export const deleteStaffApi = async (id: string) => {
  const res = await api.delete(`/staff/${id}`)
  return res.data
}