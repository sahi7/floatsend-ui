import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Inbox, ChevronRight, Mail } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { inboxService } from '@/services/inbox'
import { formatRelative, cn } from '@/lib/utils'

const STATUSES = ['', 'open', 'pending', 'closed', 'spam'] as const

export function InboxListPage() {
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 50

  const listQuery = useQuery({
    queryKey: ['inbox-conversations', status, offset],
    queryFn: async () =>
      (
        await inboxService.listConversations({
          status: status || undefined,
          limit,
          offset,
        })
      ).data,
    refetchInterval: 30_000,
  })

  const conversations = listQuery.data?.conversations ?? []

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Conversations from outbound API sends and inbound replies. Read-only for now."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => {
              setStatus(s)
              setOffset(0)
            }}
            className={cn(
              'rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer',
              status === s
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]',
            )}
          >
            {s || 'all'}
          </button>
        ))}
      </div>

      {listQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!listQuery.isLoading && conversations.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No conversations"
          description="Threads appear when you send mail via the API or receive inbound replies on an inbound-enabled domain."
        />
      )}

      {conversations.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                to={`/inbox/${c.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]">
                  <Mail className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">
                      {c.subject || '(no subject)'}
                    </span>
                    <StatusChip status={c.status} />
                    {c.channel && (
                      <Badge variant="outline" className="text-[10px]">
                        {c.channel}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                    {c.mailbox_address || '—'}
                    {c.message_count != null && ` · ${c.message_count} messages`}
                    {c.last_message_at &&
                      ` · ${formatRelative(c.last_message_at)}`}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-[var(--muted-2)]" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {conversations.length >= limit && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className="text-sm text-[var(--accent)] hover:underline disabled:opacity-40 cursor-pointer"
            disabled={offset === 0}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
          >
            Previous
          </button>
          <button
            type="button"
            className="text-sm text-[var(--accent)] hover:underline cursor-pointer"
            onClick={() => setOffset((o) => o + limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
