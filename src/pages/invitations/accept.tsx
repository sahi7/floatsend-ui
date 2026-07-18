import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Logo } from '@/components/shared/logo'
import { organizationsService } from '@/services/organizations'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'

/**
 * Supports both deep-link styles:
 * - /invitations/:token
 * - /invitations/accept?token=…  (HTML invite emails)
 */
export function InvitationPage() {
  const { token: paramToken = '' } = useParams()
  const [search] = useSearchParams()
  const token = paramToken || search.get('token') || ''
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [busy, setBusy] = useState(false)

  async function accept() {
    if (!token) {
      setApiError(new ApiError({ message: 'Missing invitation token' }))
      return
    }
    setBusy(true)
    setApiError(null)
    try {
      await organizationsService.acceptInvitation(token)
      toast.success('Invitation accepted')
      navigate('/home')
    } catch (err) {
      setApiError(toApiError(err))
    } finally {
      setBusy(false)
    }
  }

  async function decline() {
    if (!token) return
    setBusy(true)
    setApiError(null)
    try {
      await organizationsService.declineInvitation(token)
      toast.message('Invitation declined')
      navigate(isAuthenticated ? '/home' : '/login')
    } catch (err) {
      setApiError(toApiError(err))
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-4">
        <Logo className="mb-8" />
        <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <h1 className="font-heading text-xl font-semibold">Invalid invite</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This invitation link is missing a token.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-4">
      <Logo className="mb-8" />
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="font-heading text-xl font-semibold">
          Workspace invitation
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You&apos;ve been invited to join a FloatSend workspace.
        </p>

        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
          className="mt-4"
        />

        {!isAuthenticated ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Sign in to accept this invitation.
            </p>
            <Button asChild className="w-full">
              <Link
                to={`/login?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`}
              >
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link
                to={`/signup?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`}
              >
                Create account
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" loading={busy} onClick={accept}>
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={decline}
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
