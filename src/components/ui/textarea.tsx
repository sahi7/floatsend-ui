import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-[var(--radius-md)] border bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]',
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'placeholder:text-[var(--muted-2)]',
          'hover:border-[var(--muted-2)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
          className,
        )}
        ref={ref}
        aria-invalid={error || undefined}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
