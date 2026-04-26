import { useState, useEffect, useCallback } from 'react'
import { fetchShipments } from '../services/api'
import mockShipments from '../data/mock_shipments.json'
import { useApp } from '../context/AppContext'

export function useShipments() {
  const { useMockData }       = useApp()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    if (useMockData) {
      console.log('✅ Mock data loaded successfully (Shipments)');
      setData(mockShipments)
      setUsingMock(true)
      setLoading(false)
      return
    }

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
  }, [useMockData])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
