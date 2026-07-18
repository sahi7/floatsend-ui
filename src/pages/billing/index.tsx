import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  FileText,
  UserRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { billingService } from '@/services/billing'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCents, usagePercent } from '@/lib/money'
import { formatDate } from '@/lib/utils'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'
import type { UsageBucket } from '@/types/billing'
import { cn } from '@/lib/utils'

export function BillingPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const queryClient = useQueryClient()

  const usageQuery = useQuery({
    queryKey: ['billing-usage'],
    queryFn: async () => (await billingService.getUsage()).data,
    refetchInterval: 45_000,
  })

  const subQuery = useQuery({
    queryKey: ['billing-subscription'],
    queryFn: async () => (await billingService.getSubscription()).data,
  })

  const generate = useMutation({
    mutationFn: () =>
      billingService.generateInvoice({
        period_start: usageQuery.data?.period_start,
        period_end: usageQuery.data?.period_end,
        force: false,
      }),
    onSuccess: async (res) => {
      toast.success('Invoice ready', {
        description: res.data.invoice_number,
      })
      await queryClient.invalidateQueries({ queryKey: ['billing-invoices'] })
      window.location.href = `/billing/invoices/${res.data.id}`
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  const usage = usageQuery.data
  const charges = usage?.charges
  const err = usageQuery.error ? toApiError(usageQuery.error) : null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        description="Plan, usage, and estimated charges for this workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            {canManage && (
              <Button asChild variant="outline" size="sm">
                <Link to="/billing/profile">
                  <UserRound className="size-3.5" />
                  Profile
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to="/billing/invoices">
                <FileText className="size-3.5" />
                Invoices
              </Link>
            </Button>
            {canManage && (
              <Button asChild size="sm">
                <Link to="/billing/plans">
                  <Sparkles className="size-3.5" />
                  Upgrade
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <ErrorAlert
        error={err}
        message={err ? userFacingAuthMessage(err) : undefined}
      />

      {usageQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : usage ? (
        <>
          {/* Plan + estimate */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-[var(--muted)]" />
                  Current plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-2xl font-semibold">
                    {usage.plan_name || usage.plan_code}
                  </span>
                  <Badge variant="outline">{usage.subscription_status}</Badge>
                  {charges?.price_always_zero && (
                    <Badge variant="success">$0 · hard limits</Badge>
                  )}
                  {charges?.hard_capped && !charges.price_always_zero && (
                    <Badge variant="warn">Hard capped</Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Period {formatDate(usage.period_start)} –{' '}
                  {formatDate(usage.period_end)}
                </p>
                <p className="text-sm">
                  Base:{' '}
                  <span className="font-medium">
                    {formatCents(
                      usage.price_monthly_cents,
                      charges?.currency,
                    )}
                    /mo
                  </span>
                </p>
                {subQuery.data?.cancel_at_period_end && (
                  <p className="text-xs text-[var(--warn)]">
                    Plan change scheduled at period end.
                  </p>
                )}
                {canManage && (
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/billing/plans">
                      Change plan
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estimated charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {charges?.price_always_zero ? (
                  <>
                    <p className="font-heading text-3xl font-semibold text-[var(--success)]">
                      {formatCents(0, charges.currency)}
                    </p>
                    <p className="text-[var(--muted)]">
                      Free plan — usage still counts toward hard caps. You are
                      never charged.
                    </p>
                  </>
                ) : (
                  <>
                    <Row
                      label="Plan base"
                      value={formatCents(
                        charges?.plan_base_cents,
                        charges?.currency,
                      )}
                    />
                    {(charges?.overage_emails ?? 0) > 0 && (
                      <Row
                        label={`Overage (${charges?.overage_emails.toLocaleString()} emails)`}
                        value={formatCents(
                          charges?.overage_cents,
                          charges?.currency,
                        )}
                      />
                    )}
                    <div className="border-t border-[var(--border)] pt-2">
                      <Row
                        label="Estimated total"
                        value={formatCents(
                          charges?.estimated_total_cents,
                          charges?.currency,
                        )}
                        strong
                      />
                    </div>
                    {charges?.overage_mode === 'soft' && (
                      <p className="text-xs text-[var(--muted)]">
                        Soft overage — sends continue; overage is billed at{' '}
                        {formatCents(
                          charges.overage_per_1000_cents,
                          charges.currency,
                        )}{' '}
                        per 1k live emails.
                      </p>
                    )}
                  </>
                )}
                {canManage && (
                  <Button
                    className="mt-2"
                    size="sm"
                    loading={generate.isPending}
                    onClick={() => generate.mutate()}
                  >
                    Generate invoice for this period
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage bars */}
          <section className="space-y-3">
            <h2 className="font-heading text-sm font-semibold">Usage</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <UsageCard
                title="Live emails (period)"
                bucket={usage.usage.live_monthly}
                currency={charges?.currency}
                free={charges?.price_always_zero}
              />
              <UsageCard
                title="Live emails (today)"
                bucket={usage.usage.live_daily}
                free={charges?.price_always_zero}
              />
              <UsageCard
                title="Test emails (period)"
                bucket={usage.usage.test_monthly}
              />
              <UsageCard
                title="Test emails (today)"
                bucket={usage.usage.test_daily}
              />
            </div>
            {usage.usage.live_monthly?.over_limit &&
              charges?.hard_capped && (
                <div className="rounded-[var(--radius-md)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3 py-2.5 text-sm text-[var(--warn)]">
                  You hit the Free plan limit. Upgrade to keep sending — the
                  API returns <code className="font-mono">quota_exceeded</code>{' '}
                  (429) until the window resets.
                  {canManage && (
                    <>
                      {' '}
                      <Link
                        to="/billing/plans"
                        className="underline text-[var(--accent)]"
                      >
                        View plans
                      </Link>
                    </>
                  )}
                </div>
              )}
          </section>
        </>
      ) : null}
    </div>
  )
}

function UsageCard({
  title,
  bucket,
  free,
}: {
  title: string
  bucket?: UsageBucket
  currency?: string
  free?: boolean
}) {
  if (!bucket) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-[var(--muted)]">
          {title}: n/a
        </CardContent>
      </Card>
    )
  }
  const pct = usagePercent(bucket.used, bucket.limit)
  const unlimited = bucket.limit <= 0 || bucket.limit >= 1_000_000_000

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {title}
          </p>
          {bucket.over_limit && (
            <Badge variant="danger">Over limit</Badge>
          )}
        </div>
        <p className="font-heading text-lg font-semibold tabular-nums">
          {bucket.used.toLocaleString()}
          {!unlimited && (
            <span className="text-sm font-normal text-[var(--muted)]">
              {' '}
              / {bucket.limit.toLocaleString()}
            </span>
          )}
          {free && title.includes('period') && title.includes('Live') && (
            <span className="ml-2 text-sm font-normal text-[var(--success)]">
              · $0.00
            </span>
          )}
        </p>
        {!unlimited && (
          <Progress
            value={pct}
            className={cn(
              bucket.over_limit && '[&_[data-state]]:bg-[var(--danger)]',
            )}
          />
        )}
        <p className="text-[11px] text-[var(--muted-2)]">
          {unlimited
            ? 'No hard cap'
            : `${bucket.remaining.toLocaleString()} remaining`}
        </p>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className={strong ? 'font-medium' : 'text-[var(--muted)]'}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          strong && 'font-heading text-lg font-semibold',
        )}
      >
        {value}
      </span>
    </div>
  )
}
