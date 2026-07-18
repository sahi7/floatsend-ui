import { cn } from '@/lib/utils'
import {
  TRANSACTIONAL_PLAN_TIERS,
  formatEmailsPerMonth,
  formatOveragePer1000,
  formatPlanPrice,
  type PlanTier,
} from '@/lib/plans'

interface PlansTableProps {
  className?: string
  /** Highlight matching tier code or family */
  currentCode?: string | null
  compact?: boolean
}

export function PlansTable({ className, currentCode, compact }: PlansTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]',
        className,
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
            <Th>Plan</Th>
            <Th>Price</Th>
            <Th>Emails/mo</Th>
            <Th>Overage per 1,000 emails</Th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONAL_PLAN_TIERS.map((tier) => {
            const active =
              currentCode != null &&
              (tier.code === currentCode.toLowerCase() ||
                tier.apiAliases?.some(
                  (a) => a.toLowerCase() === currentCode.toLowerCase(),
                ))
            return (
              <tr
                key={tier.code}
                className={cn(
                  'border-b border-[var(--border)] last:border-b-0',
                  'bg-[var(--bg)] transition-colors hover:bg-[var(--surface)]',
                  active && 'bg-[var(--accent-soft)]',
                )}
              >
                <Td className="font-medium text-[var(--text)]">
                  <div className="flex flex-col gap-0.5">
                    <span>{tier.familyLabel}</span>
                    {!compact && tier.family !== 'free' && tier.family !== 'enterprise' && (
                      <span className="text-xs font-normal text-[var(--muted-2)]">
                        {tier.name.replace(/^Pro · |^Scale · /, '')} tier
                      </span>
                    )}
                    {active && (
                      <span className="text-xs font-medium text-[var(--accent)]">
                        Current
                      </span>
                    )}
                  </div>
                </Td>
                <Td>
                  {tier.isCustom
                    ? 'Custom'
                    : `${formatPlanPrice(tier.priceMonthlyCents)}/mo`}
                </Td>
                <Td>{formatEmailsPerMonth(tier.emailsPerMonth)}</Td>
                <Td>
                  {formatOveragePer1000(
                    tier.overagePer1000Cents,
                    tier.overageUnavailable,
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--muted-2)]">
      {children}
    </th>
  )
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={cn('px-4 py-3 text-[var(--muted)]', className)}>{children}</td>
  )
}

/** Compact family cards for marketing previews */
export function PlanFamilyCards({ className }: { className?: string }) {
  const free = TRANSACTIONAL_PLAN_TIERS.find((t) => t.code === 'free')!
  const pro = TRANSACTIONAL_PLAN_TIERS.filter((t) => t.family === 'pro')
  const scale = TRANSACTIONAL_PLAN_TIERS.filter((t) => t.family === 'scale')

  const cards: { name: string; price: string; note: string }[] = [
    {
      name: free.familyLabel,
      price: formatPlanPrice(free.priceMonthlyCents),
      note: `${formatEmailsPerMonth(free.emailsPerMonth)} emails/mo · ${free.dailyLimit}/day cap`,
    },
    {
      name: 'Pro',
      price: formatPlanPrice(pro[0].priceMonthlyCents),
      note: `From ${formatEmailsPerMonth(pro[0].emailsPerMonth)} emails · ${formatOveragePer1000(pro[0].overagePer1000Cents)} / 1k overage`,
    },
    {
      name: 'Scale',
      price: formatPlanPrice(scale[0].priceMonthlyCents),
      note: `From ${formatEmailsPerMonth(scale[0].emailsPerMonth)} emails · volume tiers to 2.5M`,
    },
  ]

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {cards.map((p) => (
        <div
          key={p.name}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition-all duration-200 hover:border-[var(--muted-2)]"
        >
          <p className="text-sm text-[var(--muted)]">{p.name}</p>
          <p className="mt-2 font-heading text-3xl font-semibold">
            {p.price}
            {p.price !== 'Custom' && (
              <span className="text-sm font-normal text-[var(--muted-2)]">
                /mo
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">{p.note}</p>
        </div>
      ))}
    </div>
  )
}

export type { PlanTier }
