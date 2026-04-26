import { useState, useEffect, useCallback } from 'react'
import { fetchSuppliers } from '../services/api'
import mockSuppliers from '../data/mock_suppliers.json'

export function useSuppliers() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchSuppliers()
      setData(res.data.data || [])
      setUsingMock(false)
    } catch (err) {
      console.warn('[useSuppliers] API unavailable, loading mock data')
      setData(mockSuppliers)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
