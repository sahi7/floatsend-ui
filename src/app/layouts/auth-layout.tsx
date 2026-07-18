import { Outlet, Navigate, Link } from 'react-router-dom'
import { Logo } from '@/components/shared/logo'
import { useAuth } from '@/app/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)]">
        <Skeleton className="h-10 w-40" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    if (!user.email_verified) {
      return <Navigate to="/verify-email" replace />
    }
    return <Navigate to="/home" replace />
  }

  return (
    <div className="relative min-h-dvh bg-[var(--bg)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% -15%, color-mix(in srgb, var(--accent) 14%, transparent), transparent)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <Link
            to="/"
            className="transition-opacity duration-150 hover:opacity-90"
          >
            <Logo />
          </Link>
        </div>
        <div className="animate-[fs-scale-in_250ms_cubic-bezier(0.16,1,0.3,1)] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] sm:p-8">
          <Outlet />
        </div>
        <p className="mt-8 text-center text-xs text-[var(--muted-2)]">
          <Link to="/" className="transition-colors hover:text-[var(--muted)]">
            ← Back to FloatSend
          </Link>
        </p>
      </div>
    </div>
  )
}
