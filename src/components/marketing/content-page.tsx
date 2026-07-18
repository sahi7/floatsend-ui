import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContentSection {
  heading: string
  body: string[]
  bullets?: string[]
}

export interface ContentPageProps {
  eyebrow?: string
  title: string
  description: string
  sections: ContentSection[]
  ctaLabel?: string
  ctaTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  className?: string
}

export function ContentPage({
  eyebrow,
  title,
  description,
  sections,
  ctaLabel = 'Get started',
  ctaTo = '/signup',
  secondaryLabel = 'Read the docs',
  secondaryTo = '/docs',
  className,
}: ContentPageProps) {
  return (
    <div className={cn('pb-24', className)}>
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          {eyebrow && (
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)] text-balance">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={ctaTo}>{ctaLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={secondaryTo}>{secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-14 sm:px-6">
        {sections.map((s) => (
          <section
            key={s.heading}
            className="scroll-mt-20 animate-[fs-slide-up_400ms_ease-out]"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {s.heading}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--muted)]">
              {s.body.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
            {s.bullets && s.bullets.length > 0 && (
              <ul className="mt-4 space-y-2 border-l border-[var(--border)] pl-4">
                {s.bullets.map((b) => (
                  <li key={b} className="text-sm text-[var(--muted)]">
                    <span className="text-[var(--text)]">·</span> {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
