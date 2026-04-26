import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, ChevronDown, Link2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DEMO_USERS, ROLE_LABELS } from '../../config'

function HighwaySVG() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.12 }}>
      {/* NH-44 Srinagar to Kanyakumari */}
      <path d="M400 20 L400 80 L390 140 L395 220 L400 300 L398 380 L400 460 L395 540 L400 580" stroke="#00D4AA" strokeWidth="1.5" fill="none" strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite"/>
      </path>
      {/* NH-48 Delhi to Mumbai */}
      <path d="M410 100 L380 160 L340 230 L290 310 L250 370 L220 430" stroke="#00D4AA" strokeWidth="1.2" fill="none" strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite"/>
      </path>
      {/* NH-16 Kolkata to Chennai */}
      <path d="M570 200 L560 260 L540 320 L510 380 L480 430 L450 470" stroke="#00D4AA" strokeWidth="1.2" fill="none" strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4.5s" repeatCount="indefinite"/>
      </path>
      {/* NH-27 East-West */}
      <path d="M180 280 L260 275 L340 280 L420 278 L500 280 L580 275 L640 280" stroke="#00D4AA" strokeWidth="1" fill="none" strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="6s" repeatCount="indefinite"/>
      </path>
      {/* Pulse dots traveling along paths */}
      {[0, 0.8, 1.6, 2.4].map((delay, i) => (
        <circle key={`p1-${i}`} r="3" fill="#00D4AA" opacity="0.7">
          <animateMotion dur="4s" repeatCount="indefinite" begin={`${delay}s`} path="M400 20 L400 80 L390 140 L395 220 L400 300 L398 380 L400 460 L395 540 L400 580"/>
        </circle>
      ))}
      {[0, 1.2, 2.4, 3.6].map((delay, i) => (
        <circle key={`p2-${i}`} r="2.5" fill="#00B4D8" opacity="0.6">
          <animateMotion dur="5s" repeatCount="indefinite" begin={`${delay}s`} path="M410 100 L380 160 L340 230 L290 310 L250 370 L220 430"/>
        </circle>
      ))}
      {/* Major hub cities with glow */}
      {[
        [220, 430, 'Mumbai', true], [410, 100, 'Delhi', true], [380, 470, 'Bangalore', true],
        [450, 470, 'Chennai', true], [570, 200, 'Kolkata', true],
        [410, 350, 'Hyderabad', false], [260, 400, 'Pune', false], [240, 280, 'Ahmedabad', false],
        [350, 160, 'Jaipur', false], [460, 180, 'Lucknow', false], [400, 350, 'Nagpur', false],
        [340, 280, 'Bhopal', false], [300, 300, 'Indore', false], [230, 340, 'Surat', false],
        [360, 500, 'Coimbatore', false], [330, 520, 'Kochi', false], [520, 350, 'Vizag', false],
        [520, 170, 'Patna', false], [420, 80, 'Chandigarh', false], [600, 260, 'Bhubaneswar', false],
      ].map(([x, y, name, major]) => (
        <g key={name}>
          <circle cx={x} cy={y} r={major ? 4 : 2.5} fill="#00D4AA" opacity={major ? 0.6 : 0.3} />
          {major && <circle cx={x} cy={y} r="8" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="r" values="6;12;6" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
          </circle>}
        </g>
      ))}
    </svg>
  )
}

export default function LoginScreen() {
  const { login, authError, setAuthError } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showCreds, setShowCreds] = useState(false)
  const [shakeError, setShakeError] = useState(false)

  function selectRole(demo) {
    setSelectedRole(demo.role)
    setEmail(demo.email)
    setPassword('Demo@123')
    setAuthError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.success) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <HighwaySVG />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[420px] mx-4 p-10 rounded-2xl"
        style={{
          background: 'rgba(22,27,34,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-accent)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link2 className="w-7 h-7" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-3xl font-bold font-display" style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>ChainGuard</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Supply Chain Intelligence Platform
          </p>
        </div>

        {/* Role Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {DEMO_USERS.map(demo => {
            const rl = ROLE_LABELS[demo.role]
            const isActive = selectedRole === demo.role
            return (
              <motion.button key={demo.role}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isActive ? 1.05 : 1 }}
                onClick={() => selectRole(demo)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer border"
                style={{
                  background: isActive ? 'var(--accent-subtle)' : 'var(--bg-interactive)',
                  borderColor: isActive ? 'var(--border-accent)' : 'var(--border-subtle)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <span>{rl.emoji}</span> {rl.label}
              </motion.button>
            )
          })}
        </div>

        {/* Role description */}
        <AnimatePresence mode="wait">
          {selectedRole && (
            <motion.p key={selectedRole}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs mb-4 px-3 py-2 rounded-lg"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
            >
              {ROLE_LABELS[selectedRole].label}: {DEMO_USERS.find(d => d.role === selectedRole)?.desc}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="Enter email address" autoComplete="email" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10" placeholder="Enter password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-faint)' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={submitting || !email || !password}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 rounded-lg font-semibold text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            style={{
              background: submitting
                ? 'var(--bg-interactive)'
                : 'var(--accent-gradient)',
              color: submitting ? 'var(--text-secondary)' : 'var(--bg-void)',
              border: 'none',
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : 'Sign In'}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={shakeError
                  ? { opacity: 1, height: 'auto', x: [-8, 8, -8, 8, 0] }
                  : { opacity: 1, height: 'auto' }
                }
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg text-xs"
                style={{
                  background: 'var(--status-danger-bg)',
                  borderLeft: '3px solid var(--status-danger)',
                  color: 'var(--status-danger)',
                }}
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6">
          <button onClick={() => setShowCreds(p => !p)}
            className="flex items-center gap-2 text-xs w-full justify-center cursor-pointer"
            style={{ color: 'var(--text-faint)', border: 'none', background: 'none' }}
          >
            <span>🔑 View Demo Login Credentials</span>
            <motion.span animate={{ rotate: showCreds ? 180 : 0 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.span>
          </button>

          <AnimatePresence>
            {showCreds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-lg overflow-hidden font-mono text-[11px]"
                style={{ background: 'var(--bg-void)' }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Role', 'Email', 'Password'].map(h => (
                        <th key={h} className="px-3 py-2 text-left" style={{ color: 'var(--text-faint)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_USERS.map(demo => (
                      <tr key={demo.role}
                        onClick={() => selectRole(demo)}
                        className="cursor-pointer transition-colors hover:bg-[var(--bg-interactive)]"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <td className="px-3 py-2" style={{ color: ROLE_LABELS[demo.role].color }}>
                          {ROLE_LABELS[demo.role].label}
                        </td>
                        <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{demo.email}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--text-faint)' }}>Demo@123</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
