import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { domainsService } from '@/services/domains'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { useQueryClient } from '@tanstack/react-query'

const schema = z.object({
  domain: z
    .string()
    .min(3, 'Enter a domain')
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Enter a valid domain (e.g. mail.example.com)',
    ),
})

type FormValues = z.infer<typeof schema>

export function DomainNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
      const { data } = await domainsService.create(values.domain.trim().toLowerCase())
      await queryClient.invalidateQueries({ queryKey: ['domains'] })
      navigate(`/domains/${data.id}`)
    } catch (err) {
      setApiError(toApiError(err))
    }
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/domains">
          <ArrowLeft className="size-4" />
          Domains
        </Link>
      </Button>

      <PageHeader
        title="Add domain"
        description="Use a domain you control (for example mail.yourcompany.com). You will add DNS records next to verify it."
      />

      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--accent)]">1. Domain</span>
          <span>2. Ownership</span>
          <span>3. Email setup</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full w-1/3 bg-[var(--accent)] transition-all duration-200" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md space-y-4"
        noValidate
      >
        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
        />

        <div className="space-y-1.5">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            placeholder="mail.example.com"
            autoComplete="off"
            autoCapitalize="none"
            error={Boolean(errors.domain)}
            {...register('domain')}
          />
          {errors.domain && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {errors.domain.message}
            </p>
          )}
          <p className="text-xs text-[var(--muted)]">
            Enter a full domain you control, not just a suffix like com.
          </p>
        </div>

        <div className="sticky bottom-16 flex gap-2 min-[960px]:static min-[960px]:bottom-auto">
          <Button type="submit" loading={isSubmitting} className="flex-1 sm:flex-none">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
