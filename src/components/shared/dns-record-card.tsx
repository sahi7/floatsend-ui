import { CopyButton } from '@/components/shared/copy-button'
import { Badge } from '@/components/ui/badge'
import type { DnsRecord } from '@/types/api'

interface DnsRecordCardProps {
  title: string
  record?: DnsRecord | null
  verified?: boolean
  instruction?: string
}

export function DnsRecordCard({
  title,
  record,
  verified,
  instruction,
}: DnsRecordCardProps) {
  if (!record) return null

  const type = record.type || 'TXT'
  const host = record.host || record.name || '—'
  const value = record.value || record.recommended_record || record.include || '—'

  const rows = [
    { label: 'Type', value: type },
    { label: 'Host / Name', value: host },
    { label: 'Value', value },
  ]

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-semibold">{title}</h3>
          {verified !== undefined && (
            <Badge variant={verified ? 'success' : 'warn'}>
              {verified ? 'Verified' : 'Pending'}
            </Badge>
          )}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              {row.label}
            </span>
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <code className="flex-1 break-all font-mono text-sm text-[var(--text)]">
                {row.value}
              </code>
              {row.value !== '—' && (
                <CopyButton value={row.value} size="icon" className="shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
      {(instruction || record.instruction) && (
        <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
          {instruction || record.instruction}
          <span className="mt-1 block">Recommended TTL: 300 seconds</span>
        </div>
      )}
    </div>
  )
}
