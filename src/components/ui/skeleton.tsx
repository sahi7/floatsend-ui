import type * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] bg-[var(--surface-2)]',
        'bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--border-subtle)_50%,var(--surface-2)_75%)]',
        'bg-[length:200%_100%] animate-[fs-shimmer_1.4s_ease-in-out_infinite]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
