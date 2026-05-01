import { useState, useEffect } from 'react'
import { getAllCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../api/category.api'
import type { Category } from '../types'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getAllCategoriesApi()
      setCategories(data)
    } catch {
      setError('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const createCategory = async (data: { name: string; description: string }) => {
    const cat = await createCategoryApi(data)
    setCategories((prev) => [...prev, cat])
    return cat
  }

  const updateCategory = async (id: string, data: { name?: string; description?: string }) => {
    const updated = await updateCategoryApi(id, data)
    setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)))
    return updated
  }

  const deleteCategory = async (id: string) => {
    await deleteCategoryApi(id)
    setCategories((prev) => prev.filter((c) => c._id !== id))
  }

  return { categories, loading, error, refetch: fetchCategories, createCategory, updateCategory, deleteCategory }
}