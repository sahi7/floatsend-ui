import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium transition-colors duration-150',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--surface-2)] text-[var(--muted)]',
        success:
          'border-transparent bg-[var(--success-soft)] text-[var(--success)]',
        warn: 'border-transparent bg-[var(--warn-soft)] text-[var(--warn)]',
        danger:
          'border-transparent bg-[var(--danger-soft)] text-[var(--danger)]',
        accent:
          'border-transparent bg-[var(--accent-soft)] text-[var(--accent)]',
        outline: 'border-[var(--border)] text-[var(--muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
