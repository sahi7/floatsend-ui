import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--radius-md)] text-sm font-medium',
    'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
    'disabled:pointer-events-none disabled:opacity-45',
    'active:scale-[0.98]',
    'cursor-pointer select-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-press)] hover:shadow-[var(--shadow-md)] active:bg-[var(--accent-press)]',
        secondary:
          'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--muted-2)] hover:bg-[var(--border-subtle)]',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--muted-2)] hover:bg-[var(--surface-2)]',
        ghost:
          'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        danger:
          'bg-[var(--danger)] text-white hover:brightness-110 active:brightness-95',
        'danger-outline':
          'border border-[var(--danger)] text-[var(--danger)] bg-transparent hover:bg-[var(--danger-soft)]',
        link: 'text-[var(--accent)] underline-offset-4 hover:underline h-auto p-0 active:scale-100',
      },
      size: {
        default: 'h-10 px-4 py-2 min-h-10',
        sm: 'h-8 rounded-[var(--radius-sm)] px-3 text-xs',
        lg: 'h-11 rounded-[var(--radius-md)] px-6 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span className="sr-only">Loading</span>
            <span className="inline-flex min-w-0 items-center gap-2 opacity-90">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
