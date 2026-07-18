import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { DnsRecordCard } from '@/components/shared/dns-record-card'
import { DnsZoneTip } from '@/components/shared/dns-zone-tip'
import { SesDnsTable } from '@/components/shared/ses-dns-table'
import { StatusChip } from '@/components/shared/status-chip'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { domainsService } from '@/services/domains'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'
import { cn, formatDate } from '@/lib/utils'
import type { DomainView } from '@/types/api'

function sesVerified(d: DomainView) {
  return d.ses_status === 'verified'
}

export function DomainDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const domainQuery = useQuery({
    queryKey: ['domains', id],
    queryFn: async () => {
      const { data } = await domainsService.get(id)
      return data
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const d = query.state.data
      if (!d) return false
      if (
        d.status === 'ownership_pending' ||
        d.status === 'pending' ||
        d.ses_status === 'pending_dns' ||
        d.ses_status === 'pending_create'
      ) {
        return 20_000
      }
      return false
    },
  })

  const domain = domainQuery.data

  const ownershipPhase =
    domain &&
    (!domain.ownership_verified ||
      domain.status === 'ownership_pending' ||
      domain.status === 'pending')

  const afterOwnership = domain && domain.ownership_verified
  const canSend = Boolean(domain?.can_send)
  const capacityBlocked = domain?.ses_status === 'capacity_blocked'

  useEffect(() => {
    setApiError(null)
  }, [id])

  const verifyOwnership = useMutation({
    mutationFn: () => domainsService.verifyOwnership(id),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['domains'] })
      queryClient.setQueryData(['domains', id], res.data.domain)
      const status = res.data.checks?.ownership?.status
      if (status === 'verified' || res.data.domain.ownership_verified) {
        toast.success('Ownership verified — add the email DNS records next')
      } else {
        toast.message('DNS not visible yet', {
          description:
            res.data.checks?.ownership?.detail ||
            'This can take a few minutes. Try again shortly.',
        })
      }
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const verifySes = useMutation({
    mutationFn: () => domainsService.verifySes(id),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['domains'] })
      const d = res.data.domain
      queryClient.setQueryData(['domains', id], d)
      if (d.can_send || res.data.can_send || d.ses_status === 'verified') {
        toast.success(
          d.can_send || res.data.can_send
            ? 'Domain is ready to send'
            : 'Email setup verified',
        )
      } else if (d.ses_status === 'capacity_blocked') {
        toast.error('Sending temporarily unavailable', {
          description:
            'We cannot finish setup right now. Please try again later.',
        })
      } else if (d.ses_status === 'failed') {
        toast.error('Email setup failed', {
          description:
            d.last_verification_error || d.last_error || 'See domain details',
        })
      } else {
        toast.message('Still waiting on DNS', {
          description:
            'Publish the three CNAME records, then check again. DNS can take a few minutes.',
        })
      }
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const removeDomain = useMutation({
    mutationFn: () => domainsService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['domains'] })
      toast.success('Domain removed')
      navigate('/domains')
    },
    onError: (err) => {
      setApiError(toApiError(err))
      setDeleteOpen(false)
    },
  })

  if (domainQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!domain) {
    return (
      <div>
        <p className="text-sm text-[var(--danger)]">Domain not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/domains">Back to domains</Link>
        </Button>
      </div>
    )
  }

  // 1 ownership → 2 SES DNS → 3 ready
  const step = canSend ? 3 : ownershipPhase ? 1 : 2

  const expiresAt = domain.ownership_token_expires_at
    ? new Date(domain.ownership_token_expires_at)
    : null

  const sesRecords = domain.ses_dns_records ?? []

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/domains">
          <ArrowLeft className="size-4" />
          Domains
        </Link>
      </Button>

      <PageHeader
        title={domain.domain}
        description="Verify ownership, add email DNS records, then start sending."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={domain.status} />
            {domain.ses_status && domain.ses_status !== 'none' && (
              <StatusChip status={domain.ses_status} />
            )}
            {canSend && <Badge variant="success">Ready to send</Badge>}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete domain"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 text-[var(--muted)]" />
            </Button>
          </div>
        }
      />

      <div className="mb-8">
        <div className="mb-2 flex flex-wrap justify-between gap-1 text-[11px]">
          {[
            { n: 1, label: 'Ownership' },
            { n: 2, label: 'Email DNS' },
            { n: 3, label: 'Ready' },
          ].map((s) => (
            <span
              key={s.n}
              className={
                step >= s.n
                  ? 'font-medium text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              }
            >
              {s.n}. {s.label}
            </span>
          ))}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-200"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <ErrorAlert
        error={apiError}
        message={apiError ? userFacingAuthMessage(apiError) : undefined}
        className="mb-4"
      />

      {capacityBlocked && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Sending setup is temporarily limited. Your domain cannot become
            ready to send until capacity is restored. Please try again later.
          </p>
        </div>
      )}

      {canSend && (
        <div className="mb-6 flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--success)]/40 bg-[var(--success-soft)] p-5 sm:flex-row sm:items-center">
          <CheckCircle2 className="size-8 text-[var(--success)]" />
          <div className="flex-1">
            <p className="font-heading font-semibold text-[var(--success)]">
              Ready to send
            </p>
            <p className="text-sm text-[var(--muted)]">
              Ownership and email DNS are verified. You can send from addresses
              on this domain.
            </p>
          </div>
          <Button asChild>
            <Link to="/send">Send test</Link>
          </Button>
        </div>
      )}

      {afterOwnership && (
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          <CheckItem
            done={Boolean(domain.ownership_verified)}
            title="Ownership"
            detail="TXT record verified"
          />
          <CheckItem
            done={sesVerified(domain)}
            title="Email DNS"
            detail={
              domain.ses_status === 'capacity_blocked'
                ? 'Temporarily unavailable — try again later'
                : 'CNAME records for sending from this domain'
            }
          />
        </ul>
      )}

      {ownershipPhase && (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Prove ownership
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add this TXT record at your DNS provider, then click verify. After
              ownership is confirmed, we will show the email DNS records you
              need next.
              {expiresAt && (
                <>
                  {' '}
                  This verification token expires{' '}
                  {formatDate(domain.ownership_token_expires_at)}.
                </>
              )}
            </p>
          </div>

          <DnsZoneTip domain={domain.domain} defaultOpen />

          <DnsRecordCard
            title="Ownership TXT"
            record={domain.ownership_record}
          />

          <div className="sticky bottom-16 flex flex-col gap-2 sm:flex-row min-[960px]:static">
            <Button
              onClick={() => verifyOwnership.mutate()}
              loading={verifyOwnership.isPending}
              className="flex-1 sm:flex-none"
            >
              {verifyOwnership.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking…
                </>
              ) : (
                "I've added the record"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => verifyOwnership.mutate()}
              disabled={verifyOwnership.isPending}
            >
              Check again
            </Button>
          </div>
        </section>
      )}

      {afterOwnership && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-heading text-base font-semibold">
                Email DNS records
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Add these CNAME records at your DNS provider so you can send
                from this domain. DNS updates can take a few minutes to appear.
              </p>
            </div>
            {domain.ses_status && <StatusChip status={domain.ses_status} />}
          </div>

          <DnsZoneTip domain={domain.domain} />

          {(domain.last_verification_error ||
            (domain.ses_status === 'failed' && domain.last_error)) && (
            <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]">
              {domain.last_verification_error || domain.last_error}
            </div>
          )}

          <SesDnsTable records={sesRecords} />

          <div className="sticky bottom-16 flex flex-col gap-2 sm:flex-row min-[960px]:static">
            <Button
              onClick={() => verifySes.mutate()}
              loading={verifySes.isPending}
              disabled={capacityBlocked}
              className="flex-1 sm:flex-none"
            >
              {verifySes.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking…
                </>
              ) : (
                "I've added the records"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => verifySes.mutate()}
              disabled={verifySes.isPending || capacityBlocked}
            >
              Check again
            </Button>
          </div>

          <p className="text-xs text-[var(--muted)]">
            Your domain is ready to send once ownership and these DNS records
            are both verified.
          </p>

          {domain.dmarc_record && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Optional
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                DMARC helps protect your domain reputation but is not required
                to start sending.
              </p>
              <div className="mt-3">
                <DnsRecordCard
                  title="DMARC (optional)"
                  record={domain.dmarc_record}
                  verified={domain.dmarc_detected}
                />
              </div>
            </div>
          )}
        </section>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove domain?</DialogTitle>
            <DialogDescription>
              This will soft-delete {domain.domain}. Sending from this domain
              will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={removeDomain.isPending}
              onClick={() => removeDomain.mutate()}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CheckItem({
  done,
  title,
  detail,
}: {
  done: boolean
  title: string
  detail: string
}) {
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-lg)] border p-3',
        done
          ? 'border-[var(--success)]/30 bg-[var(--success-soft)]/30'
          : 'border-[var(--border)] bg-[var(--surface)]',
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-6 items-center justify-center rounded-full border',
          done
            ? 'border-[var(--success)] text-[var(--success)]'
            : 'border-[var(--border)] text-[var(--muted)]',
        )}
      >
        {done ? <Check className="size-3.5" /> : <Circle className="size-3" />}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[var(--muted)]">{detail}</p>
      </div>
    </li>
  )
}
