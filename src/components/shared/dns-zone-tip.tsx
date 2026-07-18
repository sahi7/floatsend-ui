import { useId, useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Friendly, collapsible tip shown while users add DNS records during
 * domain verification. Explains zone auto-append behavior without jargon overload.
 */
export function DnsZoneTip({
  domain,
  className,
  defaultOpen = false,
}: {
  /** Optional apex domain for a concrete example */
  domain?: string
  className?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const exampleHost = domain
    ? `_floatsend.${domain}`
    : '_floatsend.example.com'
  const exampleShort = domain ? `_floatsend` : '_floatsend'
  const zone = domain || 'example.com'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]',
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]/60"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)]"
          aria-hidden
        >
          <Info className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-[var(--text)]">
            Tip before you save the DNS record
          </span>
          <span className="mt-0.5 block text-xs text-[var(--muted)]">
            Some providers add your domain name for you — worth a quick check
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[var(--muted)] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="space-y-3 border-t border-[var(--border)] px-4 py-4 text-sm leading-relaxed text-[var(--muted)]"
        >
          <p>
            When you paste the <strong className="font-medium text-[var(--text)]">Host / Name</strong>{' '}
            field into your DNS provider, look carefully at what ends up saved.
          </p>
          <p>
            A lot of DNS dashboards automatically append your zone (
            <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-xs text-[var(--text)]">
              {zone}
            </code>
            ) to whatever you type. If you paste the full name and they add the
            zone again, the record lands in the wrong place and verification
            will fail.
          </p>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-3 text-xs">
            <p className="font-medium text-[var(--text)]">Example</p>
            <p className="mt-2 text-[var(--muted)]">
              We may show a host like{' '}
              <code className="break-all font-mono text-[var(--text)]">
                {exampleHost}
              </code>
              .
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[var(--muted)]">
              <li>
                If your provider already adds{' '}
                <code className="font-mono text-[var(--text)]">{zone}</code>,
                enter only{' '}
                <code className="font-mono text-[var(--text)]">
                  {exampleShort}
                </code>{' '}
                (the part before your domain).
              </li>
              <li>
                If your provider asks for the full name and does{' '}
                <em>not</em> append the zone, paste the host exactly as we show
                it.
              </li>
            </ul>
          </div>

          <p className="text-xs text-[var(--muted-2)]">
            Not sure which kind you have? After saving, open the record and
            check that the final name matches what we listed — it should not
            look like the domain repeated twice (
            <code className="font-mono">
              …{zone}.{zone}
            </code>
            ).
          </p>
        </div>
      )}
    </div>
  )
}
