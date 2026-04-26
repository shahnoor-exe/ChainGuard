import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No authorization token provided' })
      }

      const token = authHeader.split(' ')[1]
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' })
      }

      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role, full_name, warehouse_city, assigned_shipment_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return res.status(403).json({ success: false, message: 'User profile not found' })
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        return res.status(403).json({
          success: false,
          message: `Role '${profile.role}' is not authorized for this action`,
          required_roles: allowedRoles
        })
      }

      req.user = { ...user, ...profile }
      next()
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Authentication check failed' })
    }
  }
}
