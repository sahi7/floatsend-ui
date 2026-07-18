import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SecretReveal } from '@/pages/api-keys/secret-reveal'
import { apiKeysService } from '@/services/api-keys'
import { domainsService } from '@/services/domains'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import type { ApiKeyType } from '@/types/api'

const SCOPES = [
  'email:send',
  'email:domains:read',
  'email:domains:write',
  'api_keys:read',
  'api_keys:write',
  'organization:read',
  'webhooks:read',
  'webhooks:write',
] as const

const SCOPE_LABELS: Record<(typeof SCOPES)[number], string> = {
  'email:send': 'Send email',
  'email:domains:read': 'View domains',
  'email:domains:write': 'Manage domains',
  'api_keys:read': 'View API keys',
  'api_keys:write': 'Manage API keys',
  'organization:read': 'View workspace',
  'webhooks:read': 'View webhooks',
  'webhooks:write': 'Manage webhooks',
}

function scopeLabel(scope: string) {
  return SCOPE_LABELS[scope as (typeof SCOPES)[number]] ?? scope
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['live', 'test']),
  scopes: z.array(z.string()).min(0),
})

type FormValues = z.infer<typeof schema>

export function ApiKeyNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [reveal, setReveal] = useState<{
    raw: string
    message?: string
  } | null>(null)

  const domainsQuery = useQuery({
    queryKey: ['domains'],
    queryFn: async () => (await domainsService.list()).data,
  })

  const canCreateLive = (domainsQuery.data?.domains ?? []).some(
    (d) => d.can_send === true,
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'test',
      scopes: ['email:send'],
    },
  })

  const type = watch('type')
  const scopes = watch('scopes') || []

  // Force test when live is not allowed
  useEffect(() => {
    if (!canCreateLive && type === 'live') {
      setValue('type', 'test')
    }
  }, [canCreateLive, type, setValue])

  function toggleScope(scope: string) {
    if (scopes.includes(scope)) {
      setValue(
        'scopes',
        scopes.filter((s) => s !== scope),
        { shouldValidate: true },
      )
    } else {
      setValue('scopes', [...scopes, scope], { shouldValidate: true })
    }
  }

  async function onSubmit(values: FormValues) {
    setApiError(null)
    if (values.type === 'live' && !canCreateLive) {
      setApiError(
        new ApiError({
          error: 'validation_failed',
          message:
            'Live keys need a verified domain that is ready to send. Use a test key for now.',
        }),
      )
      return
    }
    try {
      const { data } = await apiKeysService.create({
        name: values.name,
        type: values.type as ApiKeyType,
        scopes: values.scopes,
      })
      await queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      sessionStorage.setItem('fs_last_raw_key', data.raw_key)
      setReveal({ raw: data.raw_key, message: data.message })
    } catch (err) {
      setApiError(toApiError(err))
    }
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/api-keys">
          <ArrowLeft className="size-4" />
          API keys
        </Link>
      </Button>

      <PageHeader
        title="Create API key"
        description="Give it a name and choose test or live. You will need a test key before sending test messages."
      />

      {!canCreateLive && !domainsQuery.isLoading && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3 py-2.5 text-sm text-[var(--warn)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Live keys not available yet</p>
            <p className="mt-0.5 text-[var(--muted)]">
              Create a <strong>test</strong> key to send test messages. Live
              keys unlock after you verify a domain and it is ready to send.
            </p>
            <Link
              to="/domains/new"
              className="mt-1 inline-block text-[var(--accent)] underline"
            >
              Verify a domain
            </Link>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-5"
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
            placeholder={canCreateLive ? 'Production sends' : 'My test key'}
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
          <Label>Type</Label>
          <div
            className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] p-1"
            role="group"
            aria-label="Key type"
          >
            <button
              type="button"
              onClick={() => setValue('type', 'test')}
              className={cn(
                'rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                type === 'test'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )}
            >
              Test
            </button>
            <button
              type="button"
              disabled={!canCreateLive}
              title={
                canCreateLive
                  ? 'Live production key'
                  : 'Requires a verified domain that is ready to send'
              }
              onClick={() => {
                if (canCreateLive) setValue('type', 'live')
              }}
              className={cn(
                'rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors duration-150',
                !canCreateLive && 'cursor-not-allowed opacity-40',
                canCreateLive && 'cursor-pointer',
                type === 'live'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )}
            >
              Live
            </button>
          </div>
          {type === 'live' && (
            <p className="text-xs text-[var(--muted)]">
              For production sends from your verified domain.
            </p>
          )}
          {type === 'test' && (
            <p className="text-xs text-[var(--muted)]">
              For test messages before your domain is ready. Required to send
              test emails on a new account.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Permissions</Label>
          <p className="text-xs text-[var(--muted)]">
            Choose what this key is allowed to do.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SCOPES.map((scope) => (
              <label
                key={scope}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm hover:bg-[var(--surface-2)] transition-colors"
              >
                <Checkbox
                  checked={scopes.includes(scope)}
                  onCheckedChange={() => toggleScope(scope)}
                />
                <span className="text-xs">{scopeLabel(scope)}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" loading={isSubmitting}>
          Create key
        </Button>
      </form>

      {reveal && (
        <SecretReveal
          rawKey={reveal.raw}
          message={reveal.message}
          continueLabel="Send a test email"
          onContinue={() => navigate('/send')}
          onDone={() => navigate('/api-keys')}
        />
      )}
    </div>
  )
}
