import api from './axios'
import type { Product } from '../types'

export const getAllProductsApi = async (params?: {
  category?: string
  status?: string
  supplier?: string
}): Promise<Product[]> => {
  const res = await api.get('/products', { params })
  return res.data
}

export const getProductByIdApi = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`)
  return res.data
}

export const createProductApi = async (data: Partial<Product>): Promise<Product> => {
  const res = await api.post('/products', data)
  return res.data
}

export const updateProductApi = async (id: string, data: Partial<Product>): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data)
  return res.data
}

export const deleteProductApi = async (id: string) => {
  const res = await api.delete(`/products/${id}`)
  return res.data
}