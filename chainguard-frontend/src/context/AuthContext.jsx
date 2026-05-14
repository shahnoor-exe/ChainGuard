import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children, guestUser = null }) {
  // If guestUser is injected (mock/offline mode), skip all Supabase calls entirely
  const [user, setUser] = useState(guestUser || null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(guestUser ? false : true)
  const [authError, setAuthError] = useState(null)

  // Map demo emails to their roles for reliable fallback
  const DEMO_EMAIL_ROLES = {
    'admin@chainguard.demo':     { role: 'super_admin',        full_name: 'Arjun Kumar',  avatar_initials: 'AK' },
    'manager@chainguard.demo':   { role: 'logistics_manager',  full_name: 'Priya Sharma', avatar_initials: 'PS' },
    'warehouse@chainguard.demo': { role: 'warehouse_operator', full_name: 'Rohit Patel',  avatar_initials: 'RP', warehouse_city: 'Mumbai' },
    'driver@chainguard.demo':    { role: 'driver',             full_name: 'Suresh Kumar', avatar_initials: 'SK' },
    'analyst@chainguard.demo':   { role: 'analyst',            full_name: 'Meera Iyer',   avatar_initials: 'MI' },
    'ceo@chainguard.demo':       { role: 'executive',          full_name: 'Vivek Mehta',  avatar_initials: 'VM' },
  }

  const fetchProfile = useCallback(async (userId) => {
    // Try up to 2 times in case of transient errors
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (error) throw error
        if (data) return data
      } catch (err) {
        console.warn(`[Auth] Profile fetch attempt ${attempt + 1} failed:`, err.message)
        if (attempt === 0) await new Promise(r => setTimeout(r, 500))
      }
    }
    return null
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
      console.log(`[Auth] Profile loaded: ${profile.email} → role: ${profile.role}`)
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
      // Fallback: check if this is a known demo email
      const demoInfo = DEMO_EMAIL_ROLES[sess.user.email]
      if (demoInfo) {
        console.warn(`[Auth] Profile not found, using demo fallback for: ${sess.user.email} → role: ${demoInfo.role}`)
        setUser({
          id: sess.user.id,
          email: sess.user.email,
          full_name: demoInfo.full_name,
          role: demoInfo.role,
          warehouse_city: demoInfo.warehouse_city || null,
          assigned_shipment_id: null,
          avatar_initials: demoInfo.avatar_initials,
          company_name: 'ChainGuard Demo Co.',
        })
      } else {
        // Unknown user without profile — default to read-only analyst
        console.warn(`[Auth] Unknown user without profile: ${sess.user.email} → defaulting to analyst`)
        setUser({
          id: sess.user.id,
          email: sess.user.email,
          full_name: sess.user.email.split('@')[0],
          role: 'analyst',
          warehouse_city: null,
          assigned_shipment_id: null,
          avatar_initials: sess.user.email.slice(0, 2).toUpperCase(),
          company_name: 'ChainGuard Demo Co.',
        })
      }
    }
  }, [fetchProfile])

  // Restore session on mount — skipped in mock/offline mode (guestUser is set)
  useEffect(() => {
    if (guestUser) return // offline mode — no Supabase calls

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
  }, [setUserFromSession, guestUser])

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
