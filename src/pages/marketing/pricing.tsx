import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlansTable } from '@/components/shared/plans-table'
import {
  PLAN_FAMILY_SUMMARIES,
  PLAN_NOTES,
} from '@/lib/plans'

export function PricingPage() {
  return (
    <div className="pb-24">
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            Pricing
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Transactional email plans
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)] text-balance">
            {PLAN_NOTES.transactionalIntro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/signup">Start free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Family overview */}
      <section className="border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Plans at a glance
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Free, Pro, Scale, and Enterprise for transactional email.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PLAN_FAMILY_SUMMARIES.map((f) => (
              <div
                key={f.family}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold">{f.name}</h3>
                  <p className="font-heading text-xl font-semibold">
                    {f.priceFrom}
                    {f.priceFrom !== 'Custom' && (
                      <span className="text-sm font-normal text-[var(--muted-2)]">
                        /mo
                      </span>
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-2)]">{f.note}</p>
                <ul className="mt-4 space-y-2">
                  {f.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-sm text-[var(--muted)]"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full volume table */}
      <section className="border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Volume & overage
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Plans are based on emails sent and received each month. Multiple To,
            CC, or BCC recipients count as separate emails.
          </p>
          <PlansTable className="mt-6" />
          <div className="mt-6 space-y-2 text-sm text-[var(--muted)]">
            <p>{PLAN_NOTES.freeDaily}</p>
            <p>{PLAN_NOTES.overage}</p>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Enterprise
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            {PLAN_NOTES.enterprise}
          </p>
          <ul className="mt-4 space-y-2 border-l border-[var(--border)] pl-4">
            {[
              'Volume-based pricing',
              'Priority support',
              'SLA guarantees',
              'Flexible data retention',
              'SSO',
            ].map((b) => (
              <li key={b} className="text-sm text-[var(--muted)]">
                <span className="text-[var(--text)]">·</span> {b}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/enterprise">Learn about Enterprise</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Start free, scale when you need volume
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
            Free stays $0 with hard daily and monthly caps. Upgrade to Pro or
            Scale for included volume and soft overage — estimate charges live
            in the product.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/signup">Create account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
