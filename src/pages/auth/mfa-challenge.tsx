import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/shared/otp-input'
import { ErrorAlert } from '@/components/shared/error-alert'
import { authService } from '@/services/auth'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'

export function MfaChallengePage() {
  const { mfaToken, setMfaToken, applyTokenResult } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const token = mfaToken || sessionStorage.getItem('fs_mfa_token')

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setApiError(null)
    try {
      const { data } = await authService.mfaChallenge({
        mfa_token: token,
        mfa_code: useRecovery ? undefined : code,
        recovery_code: useRecovery ? recovery : undefined,
      })
      sessionStorage.removeItem('fs_mfa_token')
      setMfaToken(null)
      await applyTokenResult(data)
      navigate(data.email_verified ? '/home' : '/verify-email')
    } catch (err) {
      const error = toApiError(err)
      setApiError(error)
      if (error.error === 'mfa_invalid') {
        setShake(true)
        window.setTimeout(() => setShake(false), 400)
        setCode('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = useRecovery
    ? recovery.trim().length > 0
    : code.length === 6

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">
        Two-factor authentication
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {useRecovery
          ? 'Enter one of your recovery codes.'
          : 'Enter the 6-digit code from your authenticator app.'}
      </p>

      <form
        className={cn('mt-6 space-y-4', shake && 'animate-[shake_0.4s_ease]')}
        onSubmit={handleSubmit}
      >
        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
        />

        {useRecovery ? (
          <div className="space-y-1.5">
            <Label htmlFor="recovery">Recovery code</Label>
            <Input
              id="recovery"
              value={recovery}
              onChange={(e) => setRecovery(e.target.value)}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
        ) : (
          <OtpInput
            value={code}
            onChange={setCode}
            error={Boolean(apiError)}
            disabled={submitting}
          />
        )}

        <Button
          type="submit"
          className="w-full"
          loading={submitting}
          disabled={!canSubmit}
        >
          Verify
        </Button>

        <button
          type="button"
          className="w-full text-center text-sm text-[var(--accent)] hover:underline"
          onClick={() => {
            setUseRecovery((v) => !v)
            setApiError(null)
            setCode('')
            setRecovery('')
          }}
        >
          {useRecovery ? 'Use authenticator code' : 'Use recovery code'}
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
