import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrength } from '@/components/shared/password-strength'
import { ErrorAlert } from '@/components/shared/error-alert'
import { authService } from '@/services/auth'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, getFieldErrors, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { setTokens } from '@/lib/token-storage'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  org_name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const { applyTokenResult } = useAuth()
  const [apiError, setApiError] = useState<ApiError | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', org_name: '' },
  })

  const password = watch('password')

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      const { data } = await authService.signup({
        name: values.name,
        email: values.email,
        password: values.password,
        org_name: values.org_name || undefined,
      })
      setTokens(data.access_token, data.refresh_token)
      await applyTokenResult(data)
      if (data.debug_verify_token) {
        sessionStorage.setItem('fs_debug_verify_token', data.debug_verify_token)
      }
      sessionStorage.setItem('fs_pending_email', values.email)
      navigate('/verify-email')
    } catch (err) {
      const e = toApiError(err)
      setApiError(e)
      const fields = getFieldErrors(e)
      Object.entries(fields).forEach(([key, message]) => {
        if (key in values) {
          setError(key as keyof FormValues, { message })
        }
      })
      if (e.error === 'validation_failed' && e.message) {
        // backend password rules shown inline via message
      }
    }
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Start sending transactional email in minutes.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
        />

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            error={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.password)}
            {...register('password')}
          />
          <PasswordStrength password={password || ''} />
          {errors.password && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org_name">Organization name</Label>
          <Input
            id="org_name"
            autoComplete="organization"
            placeholder="Acme Inc"
            {...register('org_name')}
          />
          <p className="text-xs text-[var(--muted)]">
            We&apos;ll create a workspace for you.
          </p>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-[var(--muted-2)]">
        By creating an account you agree to our terms of service.
      </p>
    </div>
  )
}
