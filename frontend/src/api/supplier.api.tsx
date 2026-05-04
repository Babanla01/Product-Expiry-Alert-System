import api from './axios'
import type { Supplier } from '../types'

export const getAllSuppliersApi = async (): Promise<Supplier[]> => {
  const res = await api.get('/suppliers')
  return res.data
}

export const createSupplierApi = async (data: {
  name: string; contactName: string; email: string; phone: string; address: string
}): Promise<Supplier> => {
  const res = await api.post('/suppliers', data)
  return res.data
}

export const updateSupplierApi = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  const res = await api.put(`/suppliers/${id}`, data)
  return res.data
}

export const deleteSupplierApi = async (id: string) => {
  const res = await api.delete(`/suppliers/${id}`)
  return res.data
}