import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorAlert } from '@/components/shared/error-alert'
import { CopyButton } from '@/components/shared/copy-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { emailsService } from '@/services/emails'
import { domainsService } from '@/services/domains'
import { apiKeysService } from '@/services/api-keys'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { setFirstSendDone } from '@/lib/onboarding'
import { useAuth } from '@/app/providers/auth-provider'
import {
  checkSendPolicy,
  formatFromAddress,
  isSuccessishStatus,
  isTerminalStatus,
  isValidMailbox,
  PLATFORM_SHARED_FROM,
  platformSharedFromHeader,
  type SendMode,
} from '@/lib/send-policy'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { EmailStatusResponse } from '@/types/api'

const schema = z.object({
  from: z
    .string()
    .min(1, 'From is required')
    .refine(
      (v) => isValidMailbox(v),
      'Use user@domain.com or "Display Name" <user@domain.com>',
    ),
  to: z.string().email('Enter a valid recipient'),
  subject: z.string().min(1, 'Subject is required'),
  text_body: z.string().min(1, 'Body is required'),
  api_key: z.string().min(10, 'Paste your API key'),
})

type FormValues = z.infer<typeof schema>

const POLL_INTERVAL_MS = 2000
const POLL_MAX_MS = 60_000

function isActiveKey(k: { is_active?: boolean; status?: string }) {
  return k.is_active || k.status === 'active'
}

export function SendPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const ownerEmail = user?.email || ''
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [accepted, setAccepted] = useState<{
    message_id: string
    status: string
  } | null>(null)
  const [liveStatus, setLiveStatus] = useState<EmailStatusResponse | null>(null)
  const [polling, setPolling] = useState(false)
  const pollKeyRef = useRef<string>('')
  const pollStartedRef = useRef<number>(0)

  const [displayName, setDisplayName] = useState('')
  const [localPart, setLocalPart] = useState('noreply')
  const [fromDomain, setFromDomain] = useState('')

  const domainsQuery = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data } = await domainsService.list()
      return data
    },
  })

  const keysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await apiKeysService.list()
      return data
    },
  })

  const sendableDomains = (domainsQuery.data?.domains ?? [])
    .filter((d) => d.can_send === true)
    .map((d) => d.domain)

  const capacityBlocked = (domainsQuery.data?.domains ?? []).some(
    (d) => d.ses_status === 'capacity_blocked',
  )

  const hasProductionDomain = sendableDomains.length > 0
  const mode: SendMode = hasProductionDomain ? 'production' : 'platform_shared'
  const domainOptions = sendableDomains

  const activeKeys = (keysQuery.data?.api_keys ?? []).filter(isActiveKey)
  const hasActiveTestKey = activeKeys.some((k) => k.type === 'test')
  // New / pre-domain accounts must create a test key first.
  // After a domain is ready, any active key unlocks the send form.
  const canSendMessages = hasProductionDomain
    ? activeKeys.length > 0
    : hasActiveTestKey
  const keysLoading = keysQuery.isLoading || domainsQuery.isLoading

  useEffect(() => {
    if (!hasProductionDomain) return
    if (!domainOptions.length) return
    if (
      !fromDomain ||
      !domainOptions.some((d) => d.toLowerCase() === fromDomain.toLowerCase())
    ) {
      setFromDomain(domainOptions[0])
      setLocalPart('noreply')
    }
  }, [hasProductionDomain, domainOptions, fromDomain])

  const lastKey =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('fs_last_raw_key') || ''
      : ''

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: platformSharedFromHeader(),
      to: ownerEmail,
      subject: 'Hello from FloatSend',
      text_body: 'It works.',
      api_key: lastKey,
    },
  })

  useEffect(() => {
    if (!hasProductionDomain) {
      setValue('from', platformSharedFromHeader(), { shouldValidate: true })
      if (ownerEmail) setValue('to', ownerEmail)
    }
  }, [hasProductionDomain, ownerEmail, setValue])

  useEffect(() => {
    if (!hasProductionDomain || !fromDomain) return
    const composed = formatFromAddress(
      localPart || 'noreply',
      fromDomain,
      displayName,
    )
    setValue('from', composed, { shouldValidate: true })
  }, [hasProductionDomain, localPart, fromDomain, displayName, setValue])

  const values = watch()

  const policy = checkSendPolicy({
    from: values.from || '',
    to: values.to || '',
    ownerEmail,
    verifiedDomains: sendableDomains,
    mode,
  })

  const fromPreview = values.from

  const curlSnippet = useMemo(() => {
    const key = values.api_key || 'fs_test_…'
    const body = {
      from: values.from || PLATFORM_SHARED_FROM,
      to: [values.to || 'you@example.com'],
      subject: values.subject || 'Hello',
      text_body: values.text_body || 'It works.',
    }
    return `curl -X POST "${import.meta.env.VITE_API_BASE_URL || 'https://sender.floatsend.com'}/v1/emails/send" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body)}'`
  }, [values])

  useEffect(() => {
    if (!accepted?.message_id || !pollKeyRef.current) return

    let cancelled = false
    setPolling(true)
    pollStartedRef.current = Date.now()

    async function tick() {
      if (cancelled) return
      if (Date.now() - pollStartedRef.current > POLL_MAX_MS) {
        setPolling(false)
        return
      }
      try {
        const { data } = await emailsService.getStatus(
          pollKeyRef.current,
          accepted!.message_id,
        )
        if (cancelled) return
        setLiveStatus(data)
        if (isTerminalStatus(data.status) || isSuccessishStatus(data.status)) {
          setPolling(false)
          if (data.status === 'failed') {
            toast.error('Delivery failed', {
              description: data.last_error || 'See status for details',
            })
          } else if (isSuccessishStatus(data.status)) {
            toast.success(
              data.status === 'delivered' ? 'Email delivered' : 'Email sent',
            )
          }
          return
        }
      } catch {
        /* keep polling */
      }
      if (!cancelled) {
        window.setTimeout(tick, POLL_INTERVAL_MS)
      }
    }

    void tick()
    return () => {
      cancelled = true
    }
  }, [accepted?.message_id])

  async function onSubmit(form: FormValues) {
    setApiError(null)
    setAccepted(null)
    setLiveStatus(null)

    if (!canSendMessages) {
      setApiError(
        new ApiError({
          message: hasProductionDomain
            ? 'Create an API key before sending a test email.'
            : 'Create a test API key before sending a test email.',
          error: 'forbidden',
        }),
      )
      return
    }

    const gate = checkSendPolicy({
      from: form.from,
      to: form.to,
      ownerEmail,
      verifiedDomains: sendableDomains,
      mode,
    })
    if (!gate.ok) {
      setApiError(new ApiError({ message: gate.message, error: 'invalid_payload' }))
      return
    }

    try {
      const { data } = await emailsService.send(form.api_key, {
        from: form.from,
        to: [form.to],
        subject: form.subject,
        text_body: form.text_body,
        html_body: `<p>${form.text_body.replace(/</g, '&lt;')}</p>`,
      })
      pollKeyRef.current = form.api_key
      setAccepted({ message_id: data.message_id, status: data.status })
      if (user?.org_id) setFirstSendDone(user.org_id)
      toast.success('Message accepted — checking delivery…')
    } catch (err) {
      const e = toApiError(err)
      setApiError(e)
      if (e.error === 'domain_not_verified') {
        toast.error('This From domain is not ready to send yet')
      } else if (e.error === 'test_recipient_not_allowed') {
        toast.error('In test mode, you can only send to your own email')
      } else if (e.error === 'quota_exceeded') {
        toast.error('Send limit reached')
      }
    }
  }

  const displayStatus = liveStatus?.status || accepted?.status
  const failed = displayStatus === 'failed'

  if (keysLoading) {
    return (
      <div>
        <PageHeader
          title="Send test email"
          description="Try a message with your API key before going live."
        />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!canSendMessages) {
    const needTestKey = !hasProductionDomain
    return (
      <div>
        <PageHeader
          title="Send test email"
          description="Try a message with your API key before going live."
        />
        <EmptyState
          icon={KeyRound}
          title={needTestKey ? 'Create a test API key first' : 'Create an API key first'}
          description={
            needTestKey
              ? 'New accounts need a test API key before sending test messages. Create one, copy it securely, then come back here to send.'
              : 'You need an active API key before you can send a test email. Create one, copy it securely, then return here.'
          }
          actionLabel={needTestKey ? 'Create test key' : 'Create API key'}
          onAction={() => navigate('/api-keys/new')}
        />
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Already created a key?{' '}
          <Link to="/api-keys" className="text-[var(--accent)] underline">
            View API keys
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Send test email"
        description="Try a message with your API key before going live."
      />

      {capacityBlocked && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Sending is temporarily limited. Test messages from FloatSend may
            still work — we are restoring full capacity.
          </p>
        </div>
      )}

      {!hasProductionDomain && (
        <div
          role="status"
          className="mb-6 rounded-[var(--radius-md)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">
                Verify a domain to send from your own address
              </p>
              <p className="mt-1 text-[var(--muted)]">
                Until then, use a <strong>test</strong> API key. Messages are
                sent as FloatSend, and the recipient must be your account email
                (
                <span className="font-medium text-[var(--text)]">
                  {ownerEmail || '…'}
                </span>
                ).
              </p>
              <Link
                to="/domains/new"
                className="mt-2 inline-block text-[var(--accent)] underline"
              >
                Add a domain
              </Link>
            </div>
          </div>
        </div>
      )}

      {hasProductionDomain && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Your domain is ready. You can send from your verified domain to any
          recipient. A live API key is recommended for production use.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <ErrorAlert
            error={apiError}
            message={apiError ? userFacingAuthMessage(apiError) : undefined}
          />

          {(accepted || liveStatus) && (
            <div
              className={cn(
                'flex items-start gap-3 rounded-[var(--radius-md)] border p-3 text-sm',
                failed
                  ? 'border-[var(--danger)]/40 bg-[var(--danger-soft)]'
                  : isSuccessishStatus(displayStatus || '')
                    ? 'border-[var(--success)]/40 bg-[var(--success-soft)]'
                    : 'border-[var(--border)] bg-[var(--surface)]',
              )}
            >
              {polling ? (
                <Loader2 className="mt-0.5 size-4 animate-spin text-[var(--accent)]" />
              ) : failed ? (
                <XCircle className="mt-0.5 size-4 text-[var(--danger)]" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-4 text-[var(--success)]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {polling ? 'Checking delivery…' : 'Status'}
                  </p>
                  <Badge
                    variant={
                      failed
                        ? 'danger'
                        : isSuccessishStatus(displayStatus || '')
                          ? 'success'
                          : 'warn'
                    }
                  >
                    {displayStatus || 'accepted'}
                  </Badge>
                </div>
                {accepted?.message_id && (
                  <p className="mt-1 break-all text-xs text-[var(--muted)]">
                    Message ID: {accepted.message_id}
                  </p>
                )}
                {liveStatus?.last_error && (
                  <p className="mt-2 text-xs text-[var(--danger)]" role="alert">
                    {liveStatus.last_error}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="api_key">API key</Label>
            <Input
              id="api_key"
              type="password"
              autoComplete="off"
              placeholder={hasProductionDomain ? 'fs_live_…' : 'fs_test_…'}
              error={Boolean(errors.api_key)}
              {...register('api_key')}
            />
            <p className="text-xs text-[var(--muted)]">
              {hasProductionDomain
                ? 'Paste the key you created. Live or test keys both work.'
                : 'Paste the test key you created. Live keys are available after your domain is verified.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--text)]">From</span>

            {!hasProductionDomain ? (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-normal text-[var(--muted)]">
                  Sender (fixed in test mode)
                </Label>
                <Input
                  readOnly
                  value={platformSharedFromHeader()}
                  className="font-mono opacity-90"
                  aria-label="Test sender address"
                />
                <p className="text-xs text-[var(--muted)]">
                  Messages show as FloatSend until you verify your own domain.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="display_name"
                    className="text-[11px] font-normal text-[var(--muted)]"
                  >
                    Display name (optional)
                  </Label>
                  <Input
                    id="display_name"
                    placeholder="Acme Support"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="local_part"
                    className="text-[11px] font-normal text-[var(--muted)]"
                  >
                    Username @ your domain
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      id="local_part"
                      placeholder="noreply"
                      value={localPart}
                      onChange={(e) =>
                        setLocalPart(e.target.value.replace(/[@\s]/g, ''))
                      }
                      error={Boolean(errors.from) || !policy.ok}
                      className="font-mono sm:flex-1"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <span className="hidden text-[var(--muted)] sm:inline">
                      @
                    </span>
                    <select
                      className="h-10 min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2 font-mono text-sm sm:max-w-[240px] cursor-pointer"
                      aria-label="From domain"
                      value={fromDomain}
                      onChange={(e) => setFromDomain(e.target.value)}
                    >
                      {domainOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-2)]">
                    Sender preview
                  </p>
                  <code className="mt-0.5 block break-all font-mono text-sm text-[var(--text)]">
                    {fromPreview || '—'}
                  </code>
                </div>
              </>
            )}

            <input type="hidden" {...register('from')} />
            {errors.from && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {errors.from.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              readOnly={!hasProductionDomain}
              error={Boolean(errors.to) || !policy.ok}
              className={!hasProductionDomain ? 'opacity-90' : undefined}
              {...register('to')}
            />
            {errors.to && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {errors.to.message}
              </p>
            )}
            {!hasProductionDomain && (
              <p className="text-xs text-[var(--muted)]">
                Locked to your account email until you verify a domain.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              error={Boolean(errors.subject)}
              {...register('subject')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="text_body">Body</Label>
            <Textarea
              id="text_body"
              rows={5}
              error={Boolean(errors.text_body)}
              {...register('text_body')}
            />
          </div>

          {!policy.ok && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {policy.message}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} disabled={!policy.ok}>
            Send test
          </Button>
        </form>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">
                Example request
              </h2>
              <CopyButton value={curlSnippet} label="Copy" />
            </div>
            <pre className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-xs leading-relaxed text-[var(--muted)]">
              {curlSnippet}
            </pre>
          </div>
          {!hasProductionDomain && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              <p className="font-heading text-sm font-semibold text-[var(--text)]">
                Test mode limits
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                <li>
                  From: FloatSend (
                  {platformSharedFromHeader()})
                </li>
                <li>To: your account email only</li>
                <li>Requires a test API key</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
