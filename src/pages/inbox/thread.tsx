import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatusChip } from '@/components/shared/status-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/shared/error-alert'
import { inboxService } from '@/services/inbox'
import { formatDate, cn } from '@/lib/utils'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import type { MessageDirection } from '@/types/inbox'

function directionVariant(
  d: MessageDirection,
): 'accent' | 'success' | 'default' {
  if (d === 'inbound') return 'success'
  if (d === 'outbound') return 'accent'
  return 'default'
}

export function InboxThreadPage() {
  const { id = '' } = useParams()

  const detailQuery = useQuery({
    queryKey: ['inbox-conversation', id],
    queryFn: async () => (await inboxService.getConversation(id)).data,
    enabled: Boolean(id),
  })

  const conv = detailQuery.data?.conversation
  const messages = detailQuery.data?.messages ?? []
  const err = detailQuery.error ? toApiError(detailQuery.error) : null

  // Chronological: oldest first
  const ordered = [...messages].sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime()
    const tb = new Date(b.created_at || 0).getTime()
    return ta - tb
  })

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/inbox">
          <ArrowLeft className="size-4" />
          Inbox
        </Link>
      </Button>

      {detailQuery.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      <ErrorAlert
        error={err}
        message={err ? userFacingAuthMessage(err) : undefined}
        className="mb-4"
      />

      {conv && (
        <>
          <PageHeader
            title={conv.subject || '(no subject)'}
            description={
              [
                conv.mailbox_address,
                conv.message_count != null
                  ? `${conv.message_count} messages`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || undefined
            }
            actions={<StatusChip status={conv.status} />}
          />

          <p className="mb-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
            Read-only thread view. Reply compose ships in a later phase.
            Threading uses Message-ID / In-Reply-To / References.
          </p>

          <ol className="space-y-4">
            {ordered.map((m) => (
              <li
                key={m.id}
                className={cn(
                  'rounded-[var(--radius-lg)] border bg-[var(--surface)] p-4',
                  m.direction === 'inbound'
                    ? 'border-[var(--success)]/25'
                    : 'border-[var(--border)]',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={directionVariant(m.direction)}>
                    {m.direction}
                  </Badge>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(m.created_at)}
                  </span>
                  {m.has_attachments && (
                    <Badge variant="outline">attachments</Badge>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-[var(--muted)]">From </span>
                    <span className="font-medium">
                      {m.from_address || '—'}
                    </span>
                  </p>
                  {m.to_addresses && m.to_addresses.length > 0 && (
                    <p className="text-xs text-[var(--muted)]">
                      To {m.to_addresses.join(', ')}
                    </p>
                  )}
                  {m.subject && (
                    <p className="text-xs text-[var(--muted-2)]">
                      Subject: {m.subject}
                    </p>
                  )}
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
                  {m.text_body || m.snippet || (
                    <span className="text-[var(--muted)]">No body</span>
                  )}
                </div>
                {(m.rfc_message_id || m.in_reply_to) && (
                  <div className="mt-3 space-y-0.5 border-t border-[var(--border)] pt-2 font-mono text-[10px] text-[var(--muted-2)]">
                    {m.rfc_message_id && (
                      <p className="truncate">Message-ID: {m.rfc_message_id}</p>
                    )}
                    {m.in_reply_to && (
                      <p className="truncate">In-Reply-To: {m.in_reply_to}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>

          {ordered.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No messages in this thread.</p>
          )}
        </>
      )}
    </div>
  )
}
