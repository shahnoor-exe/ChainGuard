import { useState, useEffect, useCallback } from 'react'
import { fetchDisruptions } from '../services/api'
import mockDisruptions from '../data/mock_disruptions.json'

export function useDisruptions() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchDisruptions()
      setData(res.data.data || [])
      setUsingMock(false)
    } catch (err) {
      console.warn('[useDisruptions] API unavailable, loading mock data')
      setData(mockDisruptions)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
