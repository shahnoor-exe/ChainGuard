import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DEMO_USERS = [
  { email: 'admin@chainguard.demo',     role: 'super_admin',        full_name: 'Arjun Kumar',  avatar_initials: 'AK', warehouse_city: null, assigned_shipment_id: null },
  { email: 'manager@chainguard.demo',   role: 'logistics_manager',  full_name: 'Priya Sharma', avatar_initials: 'PS', warehouse_city: null, assigned_shipment_id: null },
  { email: 'warehouse@chainguard.demo', role: 'warehouse_operator', full_name: 'Rohit Patel',  avatar_initials: 'RP', warehouse_city: 'Mumbai', assigned_shipment_id: null },
  { email: 'driver@chainguard.demo',    role: 'driver',             full_name: 'Suresh Kumar', avatar_initials: 'SK', warehouse_city: null, assigned_shipment_id: null },
  { email: 'analyst@chainguard.demo',   role: 'analyst',            full_name: 'Meera Iyer',   avatar_initials: 'MI', warehouse_city: null, assigned_shipment_id: null },
  { email: 'ceo@chainguard.demo',       role: 'executive',          full_name: 'Vivek Mehta',  avatar_initials: 'VM', warehouse_city: null, assigned_shipment_id: null },
]

async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n')

  // Find first in_transit shipment for driver assignment
  let driverShipmentId = null
  const { data: shipments } = await supabase
    .from('shipments')
    .select('id')
    .eq('status', 'in_transit')
    .limit(1)
  if (shipments?.length) driverShipmentId = shipments[0].id

  for (const demo of DEMO_USERS) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: 'Demo@123',
        email_confirm: true,
      })

      if (authError) {
        if (authError.message?.includes('already been registered')) {
          console.log(`⚠️  User already exists: ${demo.email} (${demo.role})`)
          // Try to get existing user and update profile
          const { data: { users } } = await supabase.auth.admin.listUsers()
          const existing = users?.find(u => u.email === demo.email)
          if (existing) {
            await supabase.from('user_profiles').upsert({
              id: existing.id,
              email: demo.email,
              full_name: demo.full_name,
              role: demo.role,
              avatar_initials: demo.avatar_initials,
              warehouse_city: demo.warehouse_city,
              assigned_shipment_id: demo.role === 'driver' ? driverShipmentId : null,
            }, { onConflict: 'id' })
          }
          continue
        }
        throw authError
      }

      // Insert profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        email: demo.email,
        full_name: demo.full_name,
        role: demo.role,
        avatar_initials: demo.avatar_initials,
        warehouse_city: demo.warehouse_city,
        assigned_shipment_id: demo.role === 'driver' ? driverShipmentId : null,
      })

      if (profileError) throw profileError
      console.log(`✅ Created user: ${demo.email} (${demo.role})`)
    } catch (err) {
      console.error(`❌ Failed: ${demo.email} — ${err.message}`)
    }
  }

  console.log('\n🎉 Demo user creation complete!')
  process.exit(0)
}

createDemoUsers()
