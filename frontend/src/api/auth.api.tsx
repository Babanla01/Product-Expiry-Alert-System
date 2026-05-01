import api from './axios'
import type { AuthUser } from '../types'

export const loginApi = async (email: string, password: string): Promise<AuthUser> => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export const getMeApi = async () => {
  const res = await api.get('/auth/me')
  return res.data
}