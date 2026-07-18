import { cn } from '@/lib/utils'

function scorePassword(password: string): number {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  return Math.min(score, 4)
}

const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const colors = [
  '',
  'bg-[var(--danger)]',
  'bg-[var(--warn)]',
  'bg-[var(--accent)]',
  'bg-[var(--success)]',
]

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = scorePassword(password)

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-[var(--surface-2)] transition-colors duration-150',
              i <= score && colors[score],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Strength: <span className="text-[var(--text)]">{labels[score]}</span>
      </p>
    </div>
  )
}
