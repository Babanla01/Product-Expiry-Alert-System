import api from './axios'
import type { Category } from '../types'

export const getAllCategoriesApi = async (): Promise<Category[]> => {
  const res = await api.get('/categories')
  return res.data
}

export const createCategoryApi = async (data: {
  name: string
  description: string
}): Promise<Category> => {
  const res = await api.post('/categories', data)
  return res.data
}

export const updateCategoryApi = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Category> => {
  const res = await api.put(`/categories/${id}`, data)
  return res.data
}

export const deleteCategoryApi = async (id: string) => {
  const res = await api.delete(`/categories/${id}`)
  return res.data
}