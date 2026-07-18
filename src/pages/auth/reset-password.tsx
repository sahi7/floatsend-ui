import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrength } from '@/components/shared/password-strength'
import { ErrorAlert } from '@/components/shared/error-alert'
import { authService } from '@/services/auth'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'

const schema = z
  .object({
    new_password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [apiError, setApiError] = useState<ApiError | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const password = watch('new_password')

  async function onSubmit(values: FormValues) {
    if (!token) {
      setApiError(new ApiError({ message: 'Missing reset token' }))
      return
    }
    setApiError(null)
    try {
      await authService.resetPassword(token, values.new_password)
      toast.success('Password updated')
      navigate('/login')
    } catch (err) {
      setApiError(toApiError(err))
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="font-heading text-xl font-semibold">Invalid link</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This reset link is missing or invalid. Request a new one.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/forgot-password">Request reset</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Set new password</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Choose a strong password for your account.
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
          <Label htmlFor="new_password">New password</Label>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.new_password)}
            {...register('new_password')}
          />
          <PasswordStrength password={password || ''} />
          {errors.new_password && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.confirm)}
            {...register('confirm')}
          />
          {errors.confirm && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.confirm.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  )
}
