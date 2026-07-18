import { CopyButton } from '@/components/shared/copy-button'
import type { DnsRecord } from '@/types/api'

/** Compact table for SES Easy DKIM CNAME records */
export function SesDnsTable({ records }: { records: DnsRecord[] }) {
  if (!records.length) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No SES DNS records yet. Complete ownership verification first — SES
        identity is provisioned after ownership.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2.5 font-medium">Type</th>
            <th className="px-3 py-2.5 font-medium">Name / Host</th>
            <th className="px-3 py-2.5 font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {records.map((rec, i) => {
            const name = rec.name || rec.host || '—'
            const value = rec.value || rec.recommended_record || '—'
            const type = rec.type || 'CNAME'
            return (
              <tr key={`${name}-${i}`}>
                <td className="px-3 py-2.5 font-mono text-xs">{type}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-1">
                    <code className="min-w-0 flex-1 break-all font-mono text-xs">
                      {name}
                    </code>
                    {name !== '—' && (
                      <CopyButton value={name} size="icon" className="shrink-0" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-1">
                    <code className="min-w-0 flex-1 break-all font-mono text-xs">
                      {value}
                    </code>
                    {value !== '—' && (
                      <CopyButton value={value} size="icon" className="shrink-0" />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted)]">
        Recommended TTL: 300 seconds. These three Amazon SES Easy DKIM CNAMEs
        are the only DNS records required for production From after ownership.
      </p>
    </div>
  )
}
