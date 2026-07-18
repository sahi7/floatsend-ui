import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorAlert } from '@/components/shared/error-alert'
import { authService } from '@/services/auth'
import { ApiError, toApiError } from '@/lib/api-error'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState<ApiError | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      await authService.forgotPassword(values.email)
      // Always show success (anti-enumeration)
      setSent(true)
      toast.success('Check your email', {
        description:
          'If an account exists, we sent a password reset link.',
      })
    } catch (err) {
      // Still show success for most errors to avoid enumeration;
      // only surface rate limits / network
      const e = toApiError(err)
      if (e.error === 'rate_limit_exceeded' || !e.status) {
        setApiError(e)
      } else {
        setSent(true)
        toast.success('Check your email', {
          description:
            'If an account exists, we sent a password reset link.',
        })
      }
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-[var(--success)]" />
        <h1 className="mt-4 font-heading text-xl font-semibold">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          If an account exists for that address, we sent a reset link.
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Reset password</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Enter your email and we&apos;ll send a reset link.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <ErrorAlert error={apiError} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        <Link to="/login" className="text-[var(--accent)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
