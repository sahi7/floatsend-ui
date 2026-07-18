import { AlertCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyToClipboard, cn } from '@/lib/utils'
import type { ApiError } from '@/lib/api-error'
import { toast } from 'sonner'

interface ErrorAlertProps {
  error?: ApiError | null
  message?: string
  className?: string
}

export function ErrorAlert({ error, message, className }: ErrorAlertProps) {
  if (!error && !message) return null
  const text = message || error?.message || 'Something went wrong'
  const traceId = error?.trace_id

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="flex-1">{text}</p>
      </div>
      {traceId && (
        <div className="flex items-center gap-2 pl-6 text-xs text-[var(--muted)]">
          <span className="font-mono">Support ID: {traceId}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[var(--muted)]"
            onClick={async () => {
              await copyToClipboard(traceId)
              toast.success('Support ID copied')
            }}
          >
            <Copy className="size-3" />
            Copy
          </Button>
        </div>
      )}
    </div>
  )
}
