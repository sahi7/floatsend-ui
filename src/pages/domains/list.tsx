import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Globe, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { domainsService } from '@/services/domains'
import { formatRelative } from '@/lib/utils'

export function DomainsListPage() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const res = await domainsService.list()
      return res.data
    },
  })

  const domains = data?.domains ?? []

  return (
    <div>
      <PageHeader
        title="Domains"
        description="Verify domains you own so you can send from your own email addresses."
        actions={
          <Button asChild>
            <Link to="/domains/new">
              <Plus className="size-4" />
              Add domain
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--danger)]">Failed to load domains.</p>
      )}

      {!isLoading && domains.length === 0 && (
        <EmptyState
          icon={Globe}
          title="No domains yet"
          description="Add a domain you own to start sending."
          actionLabel="Add domain"
          onAction={() => navigate('/domains/new')}
        />
      )}

      {!isLoading && domains.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
          {domains.map((domain) => (
            <li key={domain.id}>
              <Link
                to={`/domains/${domain.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]">
                  <Globe className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{domain.domain}</span>
                    <StatusChip status={domain.status} />
                    {domain.can_send && (
                      <StatusChip status="verified" label="Ready to send" />
                    )}
                    {domain.ses_status &&
                      domain.ses_status !== 'none' &&
                      !domain.can_send && (
                        <StatusChip status={domain.ses_status} />
                      )}
                  </div>
                  {(domain.last_verification_error || domain.last_error) && (
                    <p className="mt-0.5 truncate text-xs text-[var(--danger)]">
                      {domain.last_verification_error || domain.last_error}
                    </p>
                  )}
                  {domain.updated_at &&
                    !domain.last_error &&
                    !domain.last_verification_error && (
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Updated {formatRelative(domain.updated_at)}
                      </p>
                    )}
                </div>
                <ChevronRight className="size-4 shrink-0 text-[var(--muted-2)]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
