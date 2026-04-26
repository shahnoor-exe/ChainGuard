import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchDisruptions } from '../services/api'
import mockDisruptions from '../data/mock_disruptions.json'
import { useApp } from '../context/AppContext'

export function useDisruptions() {
  const { useMockData }       = useApp()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    if (useMockData) {
      console.log('✅ Mock data loaded successfully (Disruptions)');
      setData(mockDisruptions)
      setUsingMock(true)
      setLoading(false)
      return
    }

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
  }, [useMockData])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
