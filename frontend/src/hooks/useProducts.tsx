import { useState, useEffect, useCallback } from 'react'
import { getAllProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../api/product.api'
import type { Product } from '../types'

export const useProducts = (filters?: { category?: string; status?: string; supplier?: string }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllProductsApi(filters)
      setProducts(data)
    } catch {
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.status, filters?.supplier])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const createProduct = async (data: Partial<Product>) => {
    const newProduct = await createProductApi(data)
    setProducts(prev => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = async (id: string, data: Partial<Product>) => {
    const updated = await updateProductApi(id, data)
    setProducts(prev => prev.map(p => p._id === id ? updated : p))
    return updated
  }

  const deleteProduct = async (id: string) => {
    await deleteProductApi(id)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct }
}