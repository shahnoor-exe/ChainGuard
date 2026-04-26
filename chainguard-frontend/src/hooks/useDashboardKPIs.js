import { useState, useEffect, useCallback } from 'react'
import { fetchKPIs } from '../services/api'
import mockKpis from '../data/mock_kpis.json'
import { useApp } from '../context/AppContext'

export function useDashboardKPIs() {
  const { useMockData }       = useApp()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (useMockData) {
      console.log('✅ Mock data loaded successfully (KPIs)');
      setData(mockKpis)
      setUsingMock(true)
      setLoading(false)
      return
    }

    try {
      const res = await fetchKPIs()
      setData(res.data.data)
      setUsingMock(false)
    } catch (err) {
      console.warn('[useDashboardKPIs] API unavailable, loading mock data')
      setData(mockKpis)
      setUsingMock(true)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [useMockData])

  useEffect(() => { load() }, [load])

  return { data, loading, error, usingMock, reload: load }
}
