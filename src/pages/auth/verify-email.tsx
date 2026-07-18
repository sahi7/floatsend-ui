import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorAlert } from '@/components/shared/error-alert'
import { authService } from '@/services/auth'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [token, setToken] = useState('')
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const email =
    user?.email ||
    sessionStorage.getItem('fs_pending_email') ||
    'your email'

  useEffect(() => {
    const q = params.get('token')
    const debug = sessionStorage.getItem('fs_debug_verify_token')
    if (q) {
      setToken(q)
      void submitToken(q)
    } else if (debug) {
      setToken(debug)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !sessionStorage.getItem('fs_pending_email') &&
      !params.get('token')
    ) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate, params])

  useEffect(() => {
    if (user?.email_verified) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  async function submitToken(value: string) {
    if (!value.trim()) return
    setSubmitting(true)
    setApiError(null)
    try {
      await authService.verifyEmail(value.trim())
      sessionStorage.removeItem('fs_debug_verify_token')
      toast.success('Email verified')
      await refreshUser()
      navigate('/home', { replace: true })
    } catch (err) {
      setApiError(toApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleIveVerified() {
    setChecking(true)
    setApiError(null)
    try {
      const me = await refreshUser()
      if (me?.email_verified) {
        toast.success('Email verified')
        navigate('/home', { replace: true })
      } else {
        toast.message('Not verified yet', {
          description: 'Check your inbox or paste the token below.',
        })
      }
    } catch (err) {
      setApiError(toApiError(err))
    } finally {
      setChecking(false)
    }
  }

  async function handleResend() {
    if (!isAuthenticated || resendCooldown > 0) return
    setResending(true)
    setApiError(null)
    try {
      await authService.resendVerifyEmail()
      toast.success('Verification email sent', {
        description: `Check ${email}`,
      })
      setResendCooldown(60)
      const id = window.setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            window.clearInterval(id)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err) {
      setApiError(toApiError(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex size-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
        <Mail className="size-5" aria-hidden />
      </div>
      <h1 className="font-heading text-xl font-semibold">Check your inbox</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We sent a verification link to{' '}
        <span className="font-medium text-[var(--text)]">{email}</span> from
        FloatSend. Open the link or paste the token below.
      </p>

      <div className="mt-6 space-y-4">
        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
        />

        <Button
          type="button"
          className="w-full"
          loading={checking}
          onClick={handleIveVerified}
        >
          I&apos;ve verified
        </Button>

        {isAuthenticated && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={resending}
            disabled={resendCooldown > 0}
            onClick={() => void handleResend()}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend verification email'}
          </Button>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--surface)] px-2 text-[var(--muted)]">
              or paste token
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="token">Verification token</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste the code from your email"
            autoComplete="one-time-code"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          loading={submitting}
          disabled={!token.trim()}
          onClick={() => submitToken(token)}
        >
          Verify with token
        </Button>

        <p className="text-xs text-[var(--muted)]">
          Didn&apos;t get the email? Check spam
          {isAuthenticated
            ? ', or use Resend above.'
            : ', sign in, then use Resend.'}
        </p>
      </div>
    </div>
  )
}
