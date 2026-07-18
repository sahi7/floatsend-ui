/**
 * Transactional email plans — volume-based, mirroring industry standard tiers
 * (emails sent/received per month; each To/CC/BCC recipient counts as one email).
 */

export type PlanFamily = 'free' | 'pro' | 'scale' | 'enterprise'

export interface PlanTier {
  /** Stable code for UI + API mapping */
  code: string
  family: PlanFamily
  name: string
  /** Display label for the family column (Free, Pro, Scale, Enterprise) */
  familyLabel: string
  /** Monthly price in cents; null = custom */
  priceMonthlyCents: number | null
  /** Included emails per month; null = custom */
  emailsPerMonth: number | null
  /** Overage per 1,000 emails in cents; null = N/A or custom */
  overagePer1000Cents: number | null
  /** Free plan daily hard cap; undefined for paid/custom */
  dailyLimit?: number
  /** No overage available (hard block) */
  overageUnavailable?: boolean
  /** Custom / contact sales */
  isCustom?: boolean
  /** Suggested API plan_code aliases this tier maps to */
  apiAliases?: string[]
}

export const TRANSACTIONAL_PLAN_TIERS: PlanTier[] = [
  {
    code: 'free',
    family: 'free',
    name: 'Free',
    familyLabel: 'Free',
    priceMonthlyCents: 0,
    emailsPerMonth: 3_000,
    overagePer1000Cents: null,
    dailyLimit: 100,
    overageUnavailable: true,
    apiAliases: ['free', 'FREE', 'plan_free'],
  },
  {
    code: 'pro_50k',
    family: 'pro',
    name: 'Pro · 50k',
    familyLabel: 'Pro',
    priceMonthlyCents: 2_000,
    emailsPerMonth: 50_000,
    overagePer1000Cents: 90,
    apiAliases: ['pro', 'PRO', 'pro_50k', 'plan_pro'],
  },
  {
    code: 'pro_100k',
    family: 'pro',
    name: 'Pro · 100k',
    familyLabel: 'Pro',
    priceMonthlyCents: 3_500,
    emailsPerMonth: 100_000,
    overagePer1000Cents: 90,
    apiAliases: ['pro_100k', 'pro_100'],
  },
  {
    code: 'scale_100k',
    family: 'scale',
    name: 'Scale · 100k',
    familyLabel: 'Scale',
    priceMonthlyCents: 9_000,
    emailsPerMonth: 100_000,
    overagePer1000Cents: 90,
    apiAliases: ['scale', 'SCALE', 'scale_100k', 'plan_scale'],
  },
  {
    code: 'scale_200k',
    family: 'scale',
    name: 'Scale · 200k',
    familyLabel: 'Scale',
    priceMonthlyCents: 16_000,
    emailsPerMonth: 200_000,
    overagePer1000Cents: 80,
    apiAliases: ['scale_200k', 'scale_200'],
  },
  {
    code: 'scale_500k',
    family: 'scale',
    name: 'Scale · 500k',
    familyLabel: 'Scale',
    priceMonthlyCents: 35_000,
    emailsPerMonth: 500_000,
    overagePer1000Cents: 70,
    apiAliases: ['scale_500k', 'scale_500'],
  },
  {
    code: 'scale_1m',
    family: 'scale',
    name: 'Scale · 1M',
    familyLabel: 'Scale',
    priceMonthlyCents: 65_000,
    emailsPerMonth: 1_000_000,
    overagePer1000Cents: 65,
    apiAliases: ['scale_1m', 'scale_1000k'],
  },
  {
    code: 'scale_1_5m',
    family: 'scale',
    name: 'Scale · 1.5M',
    familyLabel: 'Scale',
    priceMonthlyCents: 82_500,
    emailsPerMonth: 1_500_000,
    overagePer1000Cents: 52,
    apiAliases: ['scale_1_5m', 'scale_1500k'],
  },
  {
    code: 'scale_2_5m',
    family: 'scale',
    name: 'Scale · 2.5M',
    familyLabel: 'Scale',
    priceMonthlyCents: 115_000,
    emailsPerMonth: 2_500_000,
    overagePer1000Cents: 46,
    apiAliases: ['scale_2_5m', 'scale_2500k'],
  },
  {
    code: 'enterprise',
    family: 'enterprise',
    name: 'Enterprise',
    familyLabel: 'Enterprise',
    priceMonthlyCents: null,
    emailsPerMonth: null,
    overagePer1000Cents: null,
    isCustom: true,
    apiAliases: ['enterprise', 'ENTERPRISE', 'plan_enterprise'],
  },
]

/** Marketing summary cards (one per family) */
export const PLAN_FAMILY_SUMMARIES: {
  family: PlanFamily
  name: string
  priceFrom: string
  note: string
  highlights: string[]
}[] = [
  {
    family: 'free',
    name: 'Free',
    priceFrom: '$0',
    note: '3,000 emails/mo · 100/day hard cap',
    highlights: [
      '3,000 emails per month',
      '100 emails per day hard limit',
      'Overage not available',
      'Always $0',
    ],
  },
  {
    family: 'pro',
    name: 'Pro',
    priceFrom: '$20',
    note: 'From 50k emails/mo · $0.90 / 1k overage',
    highlights: [
      '50,000 or 100,000 emails / month',
      '$20 or $35 / month',
      '$0.90 per 1,000 emails overage',
      'No daily sending limit',
    ],
  },
  {
    family: 'scale',
    name: 'Scale',
    priceFrom: '$90',
    note: 'From 100k emails/mo · lower overage at volume',
    highlights: [
      '100k–2.5M emails / month tiers',
      '$90–$1,150 / month',
      'Overage from $0.90 down to $0.46 / 1k',
      'No daily sending limit',
    ],
  },
  {
    family: 'enterprise',
    name: 'Enterprise',
    priceFrom: 'Custom',
    note: '3M+ emails/mo · custom terms',
    highlights: [
      'Volume-based pricing',
      'Priority support',
      'SLA guarantees',
      'Flexible data retention',
      'SSO',
    ],
  },
]

export const PLAN_NOTES = {
  transactionalIntro:
    'Transactional email plans are based on the number of emails sent and received each month. Multiple To, CC, or BCC recipients count as separate emails.',
  freeDaily:
    'The Free plan is limited to 100 emails per day. Paid plans have no daily sending limit.',
  overage:
    'Overage rates apply only to emails sent beyond the included monthly volume.',
  enterprise:
    'For teams sending 3 million or more emails per month, FloatSend offers custom Enterprise plans with volume-based pricing, priority support, SLA guarantees, flexible data retention, and SSO.',
} as const

export function formatPlanPrice(cents: number | null): string {
  if (cents == null) return 'Custom'
  if (cents === 0) return '$0'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatEmailsPerMonth(n: number | null): string {
  if (n == null) return 'Custom'
  return n.toLocaleString()
}

export function formatOveragePer1000(cents: number | null, unavailable?: boolean): string {
  if (unavailable || cents == null) {
    return unavailable ? 'Not available' : 'Custom'
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/** Match an API plan code to a catalog tier when possible */
export function matchTierByApiCode(apiCode: string | undefined | null): PlanTier | undefined {
  if (!apiCode) return undefined
  const lower = apiCode.toLowerCase()
  return TRANSACTIONAL_PLAN_TIERS.find(
    (t) =>
      t.code === lower ||
      t.apiAliases?.some((a) => a.toLowerCase() === lower),
  )
}
