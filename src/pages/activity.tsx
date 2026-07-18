import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { emailsService, logFrom, logRecipient } from '@/services/emails'
import { apiKeysService } from '@/services/api-keys'
import { formatDate, formatRelative, cn } from '@/lib/utils'
import type { EmailLogEntry, EmailLogsListParams } from '@/types/api'

const FALLBACK_STATUSES = [
  'accepted',
  'queued',
  'processing',
  'provider_accepted',
  'delivered',
  'bounced',
  'complained',
  'failed',
  'suppressed',
  'unsubscribed',
]
const FALLBACK_RANGES = ['1h', '24h', '7d', '15d', '30d', '90d', 'all']

export function ActivityPage() {
  const [params, setParams] = useSearchParams()
  const range = params.get('range') || '24h'
  const statusParam = params.get('status') || ''
  const apiKeyId = params.get('api_key_id') || ''
  const qParam = params.get('q') || ''

  const [searchInput, setSearchInput] = useState(qParam)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    statusParam ? statusParam.split(',').filter(Boolean) : [],
  )
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Debounce search → URL
  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      if (searchInput.trim()) next.set('q', searchInput.trim().slice(0, 128))
      else next.delete('q')
      setParams(next, { replace: true })
      setCursor(undefined)
    }, 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const metaQuery = useQuery({
    queryKey: ['email-logs-meta'],
    queryFn: async () => (await emailsService.logsMeta()).data,
    staleTime: 60_000,
  })

  const keysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => (await apiKeysService.list()).data,
  })

  const statuses = metaQuery.data?.statuses?.length
    ? metaQuery.data.statuses
    : FALLBACK_STATUSES
  const timeRanges = metaQuery.data?.time_ranges?.length
    ? metaQuery.data.time_ranges
    : FALLBACK_RANGES
  const maxLimit = metaQuery.data?.max_limit ?? 200
  const searchMax = metaQuery.data?.search_max_len ?? 128
  const allowed = new Set(metaQuery.data?.allowed_fields ?? [])
  const defaultFields =
    metaQuery.data?.default_fields ??
    [
      'id',
      'message_id',
      'recipient',
      'from_address',
      'subject',
      'status',
      'created_at',
      'api_key_id',
    ]

  const fields = (
    allowed.size
      ? defaultFields.filter((f) => allowed.has(f))
      : defaultFields
  ).join(',')

  const listParams: EmailLogsListParams = useMemo(
    () => ({
      range,
      status: selectedStatuses.length ? selectedStatuses.join(',') : undefined,
      api_key_id: apiKeyId || undefined,
      q: qParam || undefined,
      fields,
      limit: Math.min(50, maxLimit),
      cursor,
    }),
    [range, selectedStatuses, apiKeyId, qParam, fields, maxLimit, cursor],
  )

  const logsQuery = useQuery({
    queryKey: ['email-logs', listParams],
    queryFn: async () => (await emailsService.listLogs(listParams)).data,
    refetchInterval: 20_000,
  })

  const logs = logsQuery.data?.logs ?? []
  const selected = useMemo(() => {
    if (!logs.length) return null
    if (selectedId) {
      return (
        logs.find((l) => (l.id || l.message_id) === selectedId) || logs[0]
      )
    }
    return logs[0]
  }, [logs, selectedId])

  const timelineQuery = useQuery({
    queryKey: ['email-timeline', selected?.id || selected?.message_id],
    queryFn: async () => {
      const id = selected?.id || selected?.message_id
      if (!id) return []
      return (await emailsService.getTimeline(String(id))).data
    },
    enabled: Boolean(selected?.id || selected?.message_id),
  })

  function patchParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next)
    setCursor(undefined)
  }

  function toggleStatus(s: string) {
    setSelectedStatuses((prev) => {
      const next = prev.includes(s)
        ? prev.filter((x) => x !== s)
        : [...prev, s]
      patchParams({ status: next.length ? next.join(',') : null })
      return next
    })
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Email sends for this workspace. Newest first."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/send">Send test</Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="range">Time</Label>
          <select
            id="range"
            className="flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm"
            value={range}
            onChange={(e) => patchParams({ range: e.target.value })}
          >
            {timeRanges.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api_key">API key</Label>
          <select
            id="api_key"
            className="flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm"
            value={apiKeyId}
            onChange={(e) =>
              patchParams({ api_key_id: e.target.value || null })
            }
          >
            <option value="">All keys</option>
            {(keysQuery.data?.api_keys ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} ({k.key_prefix}…)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Recipient, sender, subject…"
            value={searchInput}
            maxLength={searchMax}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedStatuses([])
                patchParams({ status: null })
              }}
              className={cn(
                'rounded-[var(--radius-sm)] border px-2 py-1 text-xs',
                selectedStatuses.length === 0
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--muted)]',
              )}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2 py-1 text-xs capitalize',
                  selectedStatuses.includes(s)
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted)]',
                )}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {logsQuery.data?.retention_days != null && (
        <p className="mb-3 text-xs text-[var(--muted)]">
          Retention: {logsQuery.data.retention_days} days
          {logsQuery.data.visible_from
            ? ` · visible from ${formatDate(logsQuery.data.visible_from)}`
            : ''}
        </p>
      )}

      {logsQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!logsQuery.isLoading && logs.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No activity"
          description="No messages match these filters, or they are outside your plan’s history window."
          actionLabel="Send test"
          onAction={() => {
            window.location.href = '/send'
          }}
        />
      )}

      {logs.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">To</th>
                    <th className="px-3 py-2 font-medium">From</th>
                    <th className="px-3 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                  {logs.map((log) => {
                    const key = String(log.id || log.message_id)
                    const active =
                      String(selected?.id || selected?.message_id) === key
                    return (
                      <tr
                        key={key}
                        className={cn(
                          'cursor-pointer hover:bg-[var(--surface-2)]/50',
                          active && 'bg-[var(--surface-2)]',
                        )}
                        onClick={() => setSelectedId(key)}
                      >
                        <td className="px-3 py-2">
                          <StatusChip
                            status={String(log.status || 'unknown')}
                          />
                        </td>
                        <td className="max-w-[160px] truncate px-3 py-2 text-xs">
                          {logRecipient(log)}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2 text-xs text-[var(--muted)]">
                          {logFrom(log)}
                        </td>
                        <td className="px-3 py-2 text-xs text-[var(--muted)]">
                          {formatRelative(
                            String(log.created_at || log.sent_at || ''),
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {logsQuery.data?.next_cursor && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  setCursor(logsQuery.data?.next_cursor || undefined)
                }
              >
                Load more
              </Button>
            )}
          </div>

          <div className="lg:col-span-2">
            {selected && (
              <DetailPanel log={selected} timeline={timelineQuery.data ?? []} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailPanel({
  log,
  timeline,
}: {
  log: EmailLogEntry
  timeline: { event_type?: string; status?: string; timestamp?: string; created_at?: string; detail?: string; id?: string }[]
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={String(log.status || 'unknown')} />
        {log.message_id && (
          <span className="font-mono text-[11px] text-[var(--muted)]">
            {String(log.message_id)}
          </span>
        )}
      </div>
      {log.last_error != null && String(log.last_error) && (
        <div
          role="alert"
          className="mt-3 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] p-2 text-xs text-[var(--danger)]"
        >
          {String(log.last_error)}
        </div>
      )}
      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label="To" value={logRecipient(log)} />
        <Row label="From" value={logFrom(log)} />
        {log.subject != null && (
          <Row label="Subject" value={String(log.subject)} />
        )}
        {log.api_key_id != null && (
          <Row label="API key" value={String(log.api_key_id)} />
        )}

        <Row
          label="Created"
          value={
            log.created_at ? formatDate(String(log.created_at)) : undefined
          }
        />
      </dl>

      <h3 className="mt-4 font-heading text-sm font-semibold">Timeline</h3>
      {timeline.length === 0 && (
        <p className="mt-2 text-xs text-[var(--muted)]">No timeline events.</p>
      )}
      <ul className="mt-2 space-y-2">
        {timeline.map((ev, i) => (
          <li
            key={ev.id || i}
            className="border-l-2 border-[var(--border)] pl-3 text-xs"
          >
            <p className="font-medium text-[var(--text)]">
              {ev.event_type || ev.status || 'event'}
            </p>
            <p className="text-[var(--muted)]">
              {formatDate(ev.timestamp || ev.created_at)}
            </p>
            {ev.detail && (
              <p className="mt-0.5 text-[var(--muted)]">{ev.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value || value === '—') return null
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="truncate text-right text-[var(--text)]">{value}</dd>
    </div>
  )
}
