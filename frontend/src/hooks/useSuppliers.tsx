import { useState, useEffect } from 'react'
import { getAllSuppliersApi, createSupplierApi, updateSupplierApi, deleteSupplierApi } from '../api/supplier.api'
import type { Supplier } from '../types'

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await getAllSuppliersApi()
      setSuppliers(data)
    } catch {
      setError('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  const createSupplier = async (data: {
    name: string; contactName: string; email: string; phone: string; address: string
  }) => {
    const s = await createSupplierApi(data)
    setSuppliers(prev => [...prev, s])
    return s
  }

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const updated = await updateSupplierApi(id, data)
    setSuppliers(prev => prev.map(s => s._id === id ? updated : s))
    return updated
  }

  const deleteSupplier = async (id: string) => {
    await deleteSupplierApi(id)
    setSuppliers(prev => prev.filter(s => s._id !== id))
  }

  return { suppliers, loading, error, refetch: fetchSuppliers, createSupplier, updateSupplier, deleteSupplier }
}