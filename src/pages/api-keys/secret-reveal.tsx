import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CopyButton } from '@/components/shared/copy-button'

interface SecretRevealProps {
  rawKey: string
  message?: string
  onDone: () => void
  continueLabel?: string
  onContinue?: () => void
}

export function SecretReveal({
  rawKey,
  message,
  onDone,
  continueLabel = 'Done',
  onContinue,
}: SecretRevealProps) {
  const [stored, setStored] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-title"
    >
      <div className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] p-3 text-sm text-[var(--warn)]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            {message ||
              'Store this key securely. It will not be shown again.'}
          </p>
        </div>

        <h2
          id="secret-title"
          className="font-heading text-lg font-semibold"
        >
          Your API key
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Copy it now. Do not share on shared devices.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-3">
          <code className="flex-1 break-all font-mono text-sm leading-relaxed">
            {rawKey}
          </code>
          <CopyButton value={rawKey} size="icon" />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Checkbox
            id="stored"
            checked={stored}
            onCheckedChange={(v) => setStored(v === true)}
          />
          <Label htmlFor="stored" className="text-sm font-normal">
            I stored this key securely
          </Label>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onContinue && (
            <Button
              variant="secondary"
              disabled={!stored}
              onClick={() => {
                onContinue()
                onDone()
              }}
            >
              {continueLabel}
            </Button>
          )}
          <Button disabled={!stored} onClick={onDone}>
            {onContinue ? 'Close' : continueLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
