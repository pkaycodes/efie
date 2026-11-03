import { CheckCircle2, X } from 'lucide-react'
import { useStore } from '../lib/store'

export function Toast() {
  const { toast, dismissToast } = useStore()
  if (!toast) return null

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="toast__icon" aria-hidden="true">
        <CheckCircle2 size={19} />
      </span>
      <p>{toast.message}</p>
      <button type="button" onClick={dismissToast} aria-label="Dismiss notification">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
