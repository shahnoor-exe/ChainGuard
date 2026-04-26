import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useApp } from '../context/AppContext'

export function useRealtimeAlerts() {
  const [alerts, setAlerts]           = useState([])
  const [latestAlert, setLatestAlert] = useState(null)
  const { addToast }                  = useApp()
  const channelRef                    = useRef(null)

  useEffect(() => {
    // Subscribe to INSERT events on the disruptions table
    const channel = supabase
      .channel('realtime-disruptions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'disruptions',
      }, (payload) => {
        const newAlert = payload.new
        setAlerts(prev => [newAlert, ...prev].slice(0, 10))
        setLatestAlert(newAlert)
        addToast(
          `New disruption: ${newAlert.title} — ${newAlert.severity?.toUpperCase()}`,
          newAlert.severity === 'critical' ? 'error' : 'warning'
        )

        // Trigger email notification for High/Critical disruptions
        if (newAlert.severity === 'critical' || newAlert.severity === 'high') {
          import('../services/notificationService').then(({ sendDisruptionEmail }) => {
            sendDisruptionEmail({
              shipment_code: 'MULTIPLE', // Disruption affects route/area
              type: newAlert.type,
              severity: newAlert.severity,
              origin: 'SYSTEM',
              destination: 'VARIOUS',
              eta: 'Check Dashboard',
              message: `${newAlert.title}: ${newAlert.description}`
            });
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to disruptions')
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addToast])

  const clearAlerts = () => {
    setAlerts([])
    setLatestAlert(null)
  }

  return { alerts, latestAlert, clearAlerts }
}
