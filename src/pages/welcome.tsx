import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Code2,
  Gauge,
  Lock,
  Mail,
  Shield,
  Webhook,
  Zap,
} from 'lucide-react'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PlanFamilyCards } from '@/components/shared/plans-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Mail,
    title: 'Transactional email',
    body: 'Send with API keys. Track delivery status in the dashboard or via webhooks.',
  },
  {
    icon: Shield,
    title: 'Your domain, verified',
    body: 'Prove ownership and add DNS records so you can send from addresses you control.',
  },
  {
    icon: Webhook,
    title: 'Reliable webhooks',
    body: 'Get signed notifications for failures, bounces, and successful delivery.',
  },
  {
    icon: Gauge,
    title: 'Clear usage & billing',
    body: 'Live counters, free plan limits, and invoices you can understand without surprises.',
  },
  {
    icon: Lock,
    title: 'Strong security',
    body: 'Multi-factor auth, session controls, and secrets shown only once when created.',
  },
  {
    icon: Code2,
    title: 'Simple to integrate',
    body: 'Straightforward API, clear errors, and a send tester that matches production.',
  },
]

const metrics = [
  { label: 'Focus', value: 'Transactional' },
  { label: 'Access', value: 'API keys' },
  { label: 'Domains', value: 'Verified DNS' },
  { label: 'Pricing', value: 'Usage-based' },
]

export function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 80% 55% at 50% -30%, color-mix(in srgb, var(--accent) 16%, transparent), transparent)',
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center animate-[fs-slide-up_400ms_ease-out]">
              <Badge variant="outline" className="mb-6 font-normal">
                Transactional email infrastructure
              </Badge>
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]">
                Email delivery engineered for product teams
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] text-balance">
                FloatSend is the control plane and send API for OTP, receipts,
                and system mail — domains, keys, webhooks, and usage in one
                precise product.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-[160px]">
                  <Link to="/signup">
                    Start free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                  <Link to="/docs">Documentation</Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-[var(--muted-2)]">
                No credit card · Free hard limits · Upgrade when you need volume
              </p>
            </div>

            {/* Code preview */}
            <div className="mx-auto mt-16 max-w-2xl animate-[fs-slide-up_500ms_ease-out]">
              <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
                  <span className="size-2 rounded-full bg-[var(--muted-2)]" />
                  <span className="size-2 rounded-full bg-[var(--muted-2)]" />
                  <span className="size-2 rounded-full bg-[var(--muted-2)]" />
                  <span className="ml-2 font-mono text-[11px] text-[var(--muted-2)]">
                    send.sh
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
                  <code>{`curl -X POST "sender.floatsend.com/v1/emails/send" \\
  -H "Authorization: Bearer fs_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "noreply@mail.yourco.com",
    "to": ["user@example.com"],
    "subject": "Your login code",
    "text_body": "482910"
  }'`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted / metrics */}
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-[var(--bg)] px-6 py-8 text-center transition-colors duration-200 hover:bg-[var(--surface)]"
              >
                <p className="font-heading text-lg font-semibold tracking-tight">
                  {m.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-[var(--muted-2)]">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-[var(--border)] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
                Platform
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                Everything you need to send reliably
              </h2>
              <p className="mt-3 text-[var(--muted)] leading-relaxed">
                Manage domains, keys, delivery history, and billing in one place
                — then send from your product with a simple API.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={cn(
                    'group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6',
                    'transition-all duration-200 hover:border-[var(--muted-2)] hover:bg-[var(--surface-2)]',
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] transition-colors duration-200 group-hover:border-[var(--accent)]/40">
                    <f.icon className="size-4" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DX */}
        <section className="border-b border-[var(--border)] py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
                Built for product teams
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                Clear when something goes wrong
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  'Helpful error messages and support IDs when you need them',
                  'Filter activity by status, API key, and search',
                  'Signed webhooks you can trust',
                  'A test send flow that mirrors production',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-[var(--muted)]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-8">
                <Link to="/developers">
                  View documentation
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Zap className="size-4" />
                <span className="font-heading text-sm font-semibold">
                  One dashboard
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Sign in to manage domains, API keys, delivery history, webhooks,
                billing, and teammates — then use API keys to send from your app.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['Domains', 'API keys', 'Activity', 'Billing'].map((t) => (
                  <div
                    key={t}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-center text-xs font-medium text-[var(--muted)] transition-colors duration-150 hover:text-[var(--text)]"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="border-b border-[var(--border)] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
              Pricing
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
              Transparent by default
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Free: 3,000 emails/mo with a 100/day cap. Pro from $20 (50k) or
              $35 (100k). Scale from $90 with tiers up to 2.5M — soft overage
              per 1,000 emails beyond included volume.
            </p>
            <div className="mx-auto mt-12 max-w-4xl">
              <PlanFamilyCards />
            </div>
            <Button asChild className="mt-10">
              <Link to="/pricing">See full pricing</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-[var(--border)] py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              FAQ
            </h2>
            <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {[
                {
                  q: 'Is this a marketing email product?',
                  a: 'No. FloatSend is for transactional email — login codes, receipts, and system mail — with domains, webhooks, and delivery history.',
                },
                {
                  q: 'How do I send from my own address?',
                  a: 'Add a domain you own, verify it with a DNS record, then complete the email DNS setup. Once it is ready, you can send from addresses on that domain.',
                },
                {
                  q: 'Where are you located?',
                  a: 'We operate with presence in Douala, Cameroon and Delaware, United States.',
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group py-4 transition-colors duration-150"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-sm font-semibold marker:content-none">
                    {item.q}
                    <span className="text-[var(--muted-2)] transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-sm text-[var(--muted)]">
              More answers in the{' '}
              <Link to="/faq" className="text-[var(--accent)] hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center sm:px-12">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Ship transactional email with confidence
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
                Create a workspace, verify a domain, and send your first message
                in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/signup">Create account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
