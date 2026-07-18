import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { billingService } from '@/services/billing'
import { useAuth } from '@/app/providers/auth-provider'
import { toApiError, userFacingAuthMessage, type ApiError } from '@/lib/api-error'
import { toast } from 'sonner'
import { useState } from 'react'

const schema = z.object({
  billing_email: z.string().email('Enter a valid billing email'),
  full_name: z.string().min(1, 'Name is required'),
  country_or_region: z.string().optional(),
  address_line1: z.string().optional(),
  tax_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function BillingProfilePage() {
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<ApiError | null>(null)

  const profileQuery = useQuery({
    queryKey: ['billing-profile'],
    queryFn: async () => (await billingService.getProfile()).data,
    enabled: canManage,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      billing_email: '',
      full_name: '',
      country_or_region: '',
      address_line1: '',
      tax_id: '',
    },
  })

  useEffect(() => {
    if (!profileQuery.data) return
    reset({
      billing_email: profileQuery.data.billing_email || '',
      full_name: profileQuery.data.full_name || '',
      country_or_region: profileQuery.data.country_or_region || '',
      address_line1: profileQuery.data.address_line1 || '',
      tax_id: profileQuery.data.tax_id || '',
    })
  }, [profileQuery.data, reset])

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      billingService.updateProfile({
        billing_email: values.billing_email,
        full_name: values.full_name,
        country_or_region: values.country_or_region || '',
        address_line1: values.address_line1 || '',
        tax_id: values.tax_id || '',
      }),
    onSuccess: async () => {
      toast.success('Billing profile saved')
      await queryClient.invalidateQueries({ queryKey: ['billing-profile'] })
      setApiError(null)
    },
    onError: (e) => setApiError(toApiError(e)),
  })

  if (!canManage) {
    return <Navigate to="/billing" replace />
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/billing">
          <ArrowLeft className="size-4" />
          Billing
        </Link>
      </Button>

      <PageHeader
        title="Billing profile"
        description="Used on invoice PDFs. Payment card capture is not available yet."
      />

      {profileQuery.isLoading ? (
        <Skeleton className="h-64 max-w-lg" />
      ) : (
        <form
          className="max-w-lg space-y-4"
          onSubmit={handleSubmit((v) => save.mutate(v))}
          noValidate
        >
          <ErrorAlert
            error={apiError}
            message={apiError ? userFacingAuthMessage(apiError) : undefined}
          />

          <Field
            id="billing_email"
            label="Billing email"
            error={errors.billing_email?.message}
          >
            <Input
              id="billing_email"
              type="email"
              autoComplete="email"
              error={Boolean(errors.billing_email)}
              {...register('billing_email')}
            />
          </Field>

          <Field
            id="full_name"
            label="Full name / company"
            error={errors.full_name?.message}
          >
            <Input
              id="full_name"
              autoComplete="organization"
              error={Boolean(errors.full_name)}
              {...register('full_name')}
            />
          </Field>

          <Field id="country_or_region" label="Country or region">
            <Input
              id="country_or_region"
              placeholder="US"
              {...register('country_or_region')}
            />
          </Field>

          <Field id="address_line1" label="Address line 1">
            <Input
              id="address_line1"
              autoComplete="street-address"
              {...register('address_line1')}
            />
          </Field>

          <Field id="tax_id" label="Tax ID (optional)">
            <Input
              id="tax_id"
              placeholder="VAT / GST / EIN"
              {...register('tax_id')}
            />
          </Field>

          <Button type="submit" loading={isSubmitting || save.isPending}>
            Save profile
          </Button>
        </form>
      )}
    </div>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
