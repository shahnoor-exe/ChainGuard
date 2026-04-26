import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const TYPE_STYLES = {
  success: { icon: CheckCircle, bg: 'bg-green-900/80 border-green-700', text: 'text-green-300' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-900/80 border-amber-700', text: 'text-amber-300' },
  error:   { icon: XCircle,      bg: 'bg-red-900/80 border-red-700',     text: 'text-red-300'   },
  info:    { icon: Info,         bg: 'bg-blue-900/80 border-blue-700',   text: 'text-blue-300'  },
}

function Toast({ id, msg, type = 'info' }) {
  const { removeToast } = useApp()
  const style = TYPE_STYLES[type] || TYPE_STYLES.info
  const Icon = style.icon
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border backdrop-blur-sm ${style.bg} animate-fadeIn max-w-sm`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
      <p className={`text-sm flex-1 ${style.text}`}>{msg}</p>
      <button onClick={() => removeToast(id)} className="text-text-muted hover:text-text-primary shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function AlertToastContainer() {
  const { toasts } = useApp()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  )
}
