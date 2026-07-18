import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { PlansTable } from '@/components/shared/plans-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { billingService } from '@/services/billing'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCents } from '@/lib/money'
import {
  PLAN_NOTES,
  TRANSACTIONAL_PLAN_TIERS,
  formatEmailsPerMonth,
  formatOveragePer1000,
  formatPlanPrice,
  matchTierByApiCode,
} from '@/lib/plans'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { BillingPlan } from '@/types/billing'

export function BillingPlansPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const plansQuery = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => (await billingService.listPlans()).data,
  })

  const usageQuery = useQuery({
    queryKey: ['billing-usage'],
    queryFn: async () => (await billingService.getUsage()).data,
  })

  const change = useMutation({
    mutationFn: (plan_code: string) =>
      billingService.changePlan({ plan_code, immediate: true }),
    onSuccess: async (res) => {
      toast.success(`Switched to ${res.data.plan_name}`)
      await queryClient.invalidateQueries({ queryKey: ['billing-usage'] })
      await queryClient.invalidateQueries({ queryKey: ['billing-subscription'] })
      navigate('/billing')
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  if (!canManage) {
    return <Navigate to="/billing" replace />
  }

  const current = usageQuery.data?.plan_code
  const apiPlans = (plansQuery.data?.plans ?? []).filter((p) => p.is_public)
  const err = plansQuery.error ? toApiError(plansQuery.error) : null

  /** Prefer catalog-enriched view of each public API plan */
  const selectable = apiPlans.map((plan) => enrichPlan(plan))

  return (
    <div className="space-y-10">
      <Button asChild variant="ghost" size="sm" className="mb-0 -ml-2">
        <Link to="/billing">
          <ArrowLeft className="size-4" />
          Billing
        </Link>
      </Button>

      <PageHeader
        title="Plans"
        description="Transactional email plans by monthly volume. Free, Pro, Scale, and Enterprise."
      />

      <ErrorAlert
        error={err}
        message={err ? userFacingAuthMessage(err) : undefined}
      />

      {/* Full volume table (catalog) */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold">
          Volume & pricing
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {PLAN_NOTES.transactionalIntro}
        </p>
        <PlansTable currentCode={current} />
        <div className="space-y-1.5 text-xs text-[var(--muted-2)]">
          <p>{PLAN_NOTES.freeDaily}</p>
          <p>{PLAN_NOTES.overage}</p>
          <p>{PLAN_NOTES.enterprise}</p>
        </div>
      </section>

      {/* Switchable API plans */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold">
          Change workspace plan
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Select a plan available for this workspace. Included volume and
          overage match the table above.
        </p>

        {plansQuery.isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : selectable.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-[var(--muted)]">
              No public plans returned from the API. See the volume table above
              for FloatSend pricing, or{' '}
              <Link to="/contact" className="text-[var(--accent)] underline">
                contact sales
              </Link>{' '}
              for Enterprise.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {selectable.map((plan) => {
              const isCurrent = plan.code === current
              return (
                <Card
                  key={plan.code}
                  className={cn(
                    isCurrent &&
                      'border-[var(--accent)] bg-[var(--accent-soft)]/20',
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{plan.name}</CardTitle>
                      {isCurrent && <Badge variant="accent">Current</Badge>}
                    </div>
                    <p className="font-heading text-3xl font-semibold">
                      {plan.isCustom
                        ? 'Custom'
                        : formatCents(plan.price_monthly_cents)}
                      {!plan.isCustom && (
                        <span className="text-sm font-normal text-[var(--muted)]">
                          /mo
                        </span>
                      )}
                    </p>
                    {plan.price_yearly_cents > 0 && (
                      <p className="text-xs text-[var(--muted)]">
                        or {formatCents(plan.price_yearly_cents)}/yr listed
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-[var(--muted)]">
                    <ul className="space-y-1.5">
                      {plan.emailsLabel && <Li>{plan.emailsLabel}</Li>}
                      {plan.dailyLabel && <Li>{plan.dailyLabel}</Li>}
                      {plan.overageLabel && <Li>{plan.overageLabel}</Li>}
                      {plan.features.map((f) => (
                        <Li key={f}>{f}</Li>
                      ))}
                    </ul>
                    {plan.isCustom ? (
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/contact">Contact sales</Link>
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={isCurrent || change.isPending}
                        loading={
                          change.isPending && change.variables === plan.code
                        }
                        onClick={() => change.mutate(plan.code)}
                      >
                        {isCurrent
                          ? 'Current plan'
                          : `Switch to ${plan.name}`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* Enterprise always visible */}
            {!selectable.some((p) => p.isCustom) && (
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <p className="font-heading text-3xl font-semibold">Custom</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--muted)]">
                  <ul className="space-y-1.5">
                    <Li>Custom volume (3M+ emails/mo)</Li>
                    <Li>Volume-based pricing</Li>
                    <Li>Priority support & SLA</Li>
                    <Li>Flexible data retention & SSO</Li>
                  </ul>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/contact">Contact sales</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function enrichPlan(plan: BillingPlan) {
  const tier = matchTierByApiCode(plan.code)
  const catalogFallback = TRANSACTIONAL_PLAN_TIERS.find(
    (t) => t.familyLabel.toLowerCase() === plan.name.toLowerCase(),
  )
  const t = tier ?? catalogFallback

  const monthlyEnt = plan.entitlements?.['email.live.monthly_send_limit']
  const dailyEnt = plan.entitlements?.['email.daily_send_limit']
  const overageEnt = plan.entitlements?.['email.overage_per_1000_cents']
  const overageMode = plan.entitlements?.['email.overage_mode']

  const emails =
    monthlyEnt != null
      ? Number(monthlyEnt)
      : t?.emailsPerMonth ?? null
  const daily =
    dailyEnt != null ? Number(dailyEnt) : t?.dailyLimit
  const overageCents =
    typeof overageEnt === 'number'
      ? overageEnt
      : t?.overagePer1000Cents ?? null

  const isCustom =
    t?.isCustom === true ||
    plan.code.toLowerCase().includes('enterprise') ||
    plan.name.toLowerCase().includes('enterprise')

  const features: string[] = []
  if (t?.family === 'pro' || t?.family === 'scale') {
    features.push('No daily sending limit')
  }
  if (overageMode === 'hard_block' || t?.overageUnavailable) {
    features.push('Hard block at limit · always $0')
  }

  return {
    ...plan,
    isCustom,
    emailsLabel:
      emails != null
        ? `${formatEmailsPerMonth(emails)} emails / month`
        : isCustom
          ? 'Custom volume'
          : null,
    dailyLabel:
      daily != null
        ? `${daily.toLocaleString()} / day hard cap`
        : null,
    overageLabel:
      t?.overageUnavailable || overageMode === 'hard_block'
        ? 'Overage not available'
        : overageCents != null && overageCents > 0
          ? `Overage ${formatOveragePer1000(overageCents)} / 1k emails`
          : isCustom
            ? 'Custom overage'
            : null,
    features,
    displayPrice: isCustom
      ? 'Custom'
      : formatPlanPrice(
          plan.price_monthly_cents ?? t?.priceMonthlyCents ?? 0,
        ),
  }
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
      <span>{children}</span>
    </li>
  )
}
