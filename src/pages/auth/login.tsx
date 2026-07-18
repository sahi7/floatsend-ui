import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorAlert } from '@/components/shared/error-alert'
import { OtpInput } from '@/components/shared/otp-input'
import { authService } from '@/services/auth'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const passwordSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const otpEmailSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type PasswordValues = z.infer<typeof passwordSchema>
type OtpEmailValues = z.infer<typeof otpEmailSchema>

type LoginTab = 'password' | 'otp'

export function LoginPage() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const next = search.get('next') || ''
  const { applyTokenResult, setMfaToken } = useAuth()
  const [tab, setTab] = useState<LoginTab>('password')
  const [apiError, setApiError] = useState<ApiError | null>(null)

  // OTP flow
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpRequesting, setOtpRequesting] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  })

  const otpForm = useForm<OtpEmailValues>({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: { email: '' },
  })

  function afterLogin(emailVerified: boolean) {
    if (next.startsWith('/')) {
      navigate(next)
      return
    }
    navigate(emailVerified ? '/home' : '/verify-email')
  }

  async function onPasswordSubmit(values: PasswordValues) {
    setApiError(null)
    try {
      const { data } = await authService.login(values)
      await applyTokenResult(data)
      afterLogin(data.email_verified)
    } catch (err) {
      const e = toApiError(err)
      if (e.error === 'mfa_required' && e.mfa_token) {
        setMfaToken(e.mfa_token)
        sessionStorage.setItem('fs_mfa_token', e.mfa_token)
        navigate('/mfa')
        return
      }
      setApiError(e)
    }
  }

  function startResendCooldown(seconds = 60) {
    setResendCooldown(seconds)
    const id = window.setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function onOtpRequest(values: OtpEmailValues) {
    setApiError(null)
    setOtpRequesting(true)
    try {
      await authService.requestOtp(values.email)
      // Always generic success (no enumeration)
      setOtpEmail(values.email)
      setOtpStep('code')
      setOtpCode('')
      startResendCooldown(60)
      toast.success('Check your inbox', {
        description: 'If an account exists, we sent a 6-digit code.',
      })
    } catch (err) {
      const e = toApiError(err)
      if (e.error === 'rate_limit_exceeded' || !e.status) {
        setApiError(e)
      } else {
        // Still advance for anti-enumeration on 4xx that aren't rate limits
        setOtpEmail(values.email)
        setOtpStep('code')
        startResendCooldown(60)
        toast.success('Check your inbox', {
          description: 'If an account exists, we sent a 6-digit code.',
        })
      }
    } finally {
      setOtpRequesting(false)
    }
  }

  async function onOtpResend() {
    if (!otpEmail || resendCooldown > 0) return
    setOtpRequesting(true)
    setApiError(null)
    try {
      await authService.requestOtp(otpEmail)
      startResendCooldown(60)
      toast.success('Code sent', {
        description: 'If an account exists, check your email.',
      })
    } catch (err) {
      const e = toApiError(err)
      if (e.error === 'rate_limit_exceeded' || !e.status) setApiError(e)
      else {
        startResendCooldown(60)
        toast.success('Code sent')
      }
    } finally {
      setOtpRequesting(false)
    }
  }

  async function onOtpVerify(e: React.FormEvent) {
    e.preventDefault()
    if (otpCode.length !== 6) return
    setOtpVerifying(true)
    setApiError(null)
    try {
      const { data } = await authService.verifyOtp(otpEmail, otpCode)
      await applyTokenResult(data)
      // OTP success marks email_verified on backend
      afterLogin(true)
    } catch (err) {
      setApiError(toApiError(err))
      setOtpCode('')
    } finally {
      setOtpVerifying(false)
    }
  }

  async function handleGoogle() {
    try {
      const { data } = await authService.googleUrl()
      if (data.url) window.location.href = data.url
    } catch (err) {
      setApiError(toApiError(err))
    }
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Welcome back to FloatSend.
      </p>

      {/* Tabs */}
      <div
        className="mt-5 inline-flex w-full rounded-[var(--radius-md)] border border-[var(--border)] p-1"
        role="tablist"
        aria-label="Sign in method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'password'}
          className={cn(
            'flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'password'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-[var(--text)]',
          )}
          onClick={() => {
            setTab('password')
            setApiError(null)
          }}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'otp'}
          className={cn(
            'flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'otp'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--muted)] hover:text-[var(--text)]',
          )}
          onClick={() => {
            setTab('otp')
            setApiError(null)
          }}
        >
          Email code
        </button>
      </div>

      {tab === 'password' && (
        <form
          className="mt-6 space-y-4"
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          noValidate
        >
          <ErrorAlert
            error={apiError}
            message={apiError ? userFacingAuthMessage(apiError) : undefined}
          />

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              error={Boolean(passwordForm.formState.errors.email)}
              {...passwordForm.register('email')}
            />
            {passwordForm.formState.errors.email && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              error={Boolean(passwordForm.formState.errors.password)}
              {...passwordForm.register('password')}
            />
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={passwordForm.formState.isSubmitting}
          >
            Sign in
          </Button>
        </form>
      )}

      {tab === 'otp' && otpStep === 'email' && (
        <form
          className="mt-6 space-y-4"
          onSubmit={otpForm.handleSubmit(onOtpRequest)}
          noValidate
        >
          <ErrorAlert
            error={apiError}
            message={apiError ? userFacingAuthMessage(apiError) : undefined}
          />
          <p className="text-sm text-[var(--muted)]">
            We&apos;ll email a 6-digit code valid for 10 minutes. No password
            needed.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              error={Boolean(otpForm.formState.errors.email)}
              {...otpForm.register('email')}
            />
            {otpForm.formState.errors.email && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {otpForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" loading={otpRequesting}>
            Send code
          </Button>
        </form>
      )}

      {tab === 'otp' && otpStep === 'code' && (
        <form className="mt-6 space-y-4" onSubmit={onOtpVerify}>
          <ErrorAlert
            error={apiError}
            message={apiError ? userFacingAuthMessage(apiError) : undefined}
          />
          <p className="text-sm text-[var(--muted)]">
            Enter the code sent to{' '}
            <span className="font-medium text-[var(--text)]">{otpEmail}</span>
          </p>
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            error={Boolean(apiError)}
            disabled={otpVerifying}
          />
          <Button
            type="submit"
            className="w-full"
            loading={otpVerifying}
            disabled={otpCode.length !== 6}
          >
            Verify and sign in
          </Button>
          <div className="flex flex-col gap-2 text-center text-sm">
            <button
              type="button"
              className="text-[var(--accent)] hover:underline disabled:opacity-50"
              disabled={resendCooldown > 0 || otpRequesting}
              onClick={() => void onOtpResend()}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </button>
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--text)]"
              onClick={() => {
                setOtpStep('email')
                setOtpCode('')
                setApiError(null)
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-[var(--muted)]">or</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        No account?{' '}
        <Link to="/signup" className="text-[var(--accent)] hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
