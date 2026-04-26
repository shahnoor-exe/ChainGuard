import { useState, useEffect, useCallback } from 'react'
import { fetchShipments } from '../services/api'
import mockShipments from '../data/mock_shipments.json'

export function useShipments() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchShipments()
      setData(res.data.data || [])
      setUsingMock(false)
    } catch (err) {
      console.warn('[useShipments] API unavailable, loading mock data')
      setData(mockShipments)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
