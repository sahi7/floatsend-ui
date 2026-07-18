import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { SecretReveal } from '@/components/shared/secret-reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { webhooksService } from '@/services/webhooks'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import type { WebhookEventType } from '@/types/api'

const DEFAULT_SUGGESTED = [
  'email.failed',
  'email.bounced',
  'email.delivered',
  'email.provider_accepted',
  'email.complained',
]

export function WebhookNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [includeSubject, setIncludeSubject] = useState(false)
  const [selected, setSelected] = useState<string[]>(DEFAULT_SUGGESTED)
  const [allEvents, setAllEvents] = useState(false)
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const eventsQuery = useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => (await webhooksService.listEvents()).data,
  })

  const catalog = useMemo((): WebhookEventType[] => {
    const list = eventsQuery.data ?? []
    if (list.length === 0) {
      return DEFAULT_SUGGESTED.map((name) => ({ name }))
    }
    return list
  }, [eventsQuery.data])

  function toggle(name: string) {
    setAllEvents(false)
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    )
  }

  const create = useMutation({
    mutationFn: () =>
      webhooksService.createEndpoint({
        url: url.trim(),
        subscribed_events: allEvents ? ['*'] : selected,
        include_subject: includeSubject,
        description: description.trim() || undefined,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      setCreatedId(res.data.endpoint.id)
      setSecret(res.data.secret)
    },
    onError: (e) => setApiError(toApiError(e)),
  })

  const canSubmit =
    url.startsWith('https://') && (allEvents || selected.length > 0)

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/webhooks">
          <ArrowLeft className="size-4" />
          Webhooks
        </Link>
      </Button>

      <PageHeader
        title="Add webhook"
        description="Enter an HTTPS URL where FloatSend should send event notifications."
      />

      <form
        className="max-w-xl space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          setApiError(null)
          create.mutate()
        }}
      >
        <ErrorAlert
          error={apiError}
          message={apiError ? userFacingAuthMessage(apiError) : undefined}
        />

        <div className="space-y-1.5">
          <Label htmlFor="url">Endpoint URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://api.yourapp.com/hooks/floatsend"
            className="font-mono text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <p className="text-xs text-[var(--muted)]">
            Use a secure HTTPS URL.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Description (optional)</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Production notifications"
          />
        </div>

        <div className="space-y-2">
          <Label>Events</Label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={allEvents}
              onCheckedChange={(v) => {
                setAllEvents(v === true)
                if (v === true) setSelected([])
              }}
            />
            <span>All events</span>
          </label>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {catalog.map((ev) => {
              const name = ev.name
              const checked = !allEvents && selected.includes(name)
              return (
                <label
                  key={name}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm',
                    checked
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[var(--surface)]',
                    allEvents && 'opacity-50',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={allEvents}
                    onCheckedChange={() => toggle(name)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="text-xs">{name.replace(/\./g, ' · ')}</span>
                    {ev.description && (
                      <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                        {ev.description}
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
          <p className="text-xs text-[var(--muted)]">
            Suggested defaults include failed, bounce, and delivered. Unknown
            event names are rejected by the API.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={includeSubject}
              onCheckedChange={(v) => setIncludeSubject(v === true)}
              className="mt-0.5"
            />
            <span>
              Include subject in payload
              <span className="mt-0.5 block text-xs text-[var(--warn)]">
                Privacy: subject may contain PII. Prefer off unless required.
              </span>
            </span>
          </label>
        </div>

        <Button type="submit" loading={create.isPending} disabled={!canSubmit}>
          Create endpoint
        </Button>
      </form>

      {secret && (
        <SecretReveal
          secret={secret}
          title="Webhook signing secret"
          message="Store the secret securely; it will not be shown again. Rotate if lost."
          continueLabel="View endpoint"
          onContinue={() =>
            navigate(createdId ? `/webhooks/${createdId}` : '/webhooks')
          }
          onDone={() => {
            setSecret(null)
            if (!createdId) navigate('/webhooks')
          }}
        />
      )}
    </div>
  )
}
