import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.warn('[Auth] Could not fetch profile:', err.message)
      return null
    }
  }, [])

  const setUserFromSession = useCallback(async (sess) => {
    if (!sess?.user) {
      setUser(null)
      setSession(null)
      return
    }
    setSession(sess)
    const profile = await fetchProfile(sess.user.id)
    if (profile) {
      setUser({
        id: sess.user.id,
        email: sess.user.email,
        full_name: profile.full_name,
        role: profile.role,
        warehouse_city: profile.warehouse_city,
        assigned_shipment_id: profile.assigned_shipment_id,
        avatar_initials: profile.avatar_initials,
        company_name: profile.company_name || 'ChainGuard Demo Co.',
      })
    } else {
      // Fallback: basic user without profile
      setUser({
        id: sess.user.id,
        email: sess.user.email,
        full_name: sess.user.email.split('@')[0],
        role: 'logistics_manager',
        warehouse_city: null,
        assigned_shipment_id: null,
        avatar_initials: sess.user.email.slice(0, 2).toUpperCase(),
        company_name: 'ChainGuard Demo Co.',
      })
    }
  }, [fetchProfile])

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setUserFromSession(s).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (event === 'SIGNED_IN') {
          await setUserFromSession(sess)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [setUserFromSession])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message
        setAuthError(msg)
        return { success: false, error: msg }
      }
      return { success: true, error: null }
    } catch (err) {
      const msg = 'Login failed. Please check your connection.'
      setAuthError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
    if (!error) {
      setUser(prev => ({ ...prev, ...updates }))
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, session, loading, authError,
      login, logout, updateProfile, setAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
