import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const productLinks = [
  { to: '/features', label: 'Features' },
  { to: '/email-api', label: 'Email API' },
  { to: '/webhooks-docs', label: 'Webhooks' },
  { to: '/sdks', label: 'SDKs' },
  { to: '/deliverability', label: 'Deliverability' },
  { to: '/reliability', label: 'Reliability' },
  { to: '/security', label: 'Security' },
]

const resourceLinks = [
  { to: '/docs', label: 'Documentation' },
  { to: '/api', label: 'API Overview' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/status', label: 'Status' },
  { to: '/help', label: 'Help Center' },
  { to: '/blog', label: 'Templates' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] glass-header transition-all duration-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="shrink-0 transition-opacity duration-150 hover:opacity-90"
          aria-label="FloatSend home"
        >
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--muted)] transition-colors duration-150 hover:text-[var(--text)] cursor-pointer"
            >
              Product
              <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="min-w-[200px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-md)]">
                {productLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              cn(
                'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )
            }
          >
            Pricing
          </NavLink>
          <NavLink
            to="/developers"
            className={({ isActive }) =>
              cn(
                'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )
            }
          >
            Developers
          </NavLink>
          <NavLink
            to="/enterprise"
            className={({ isActive }) =>
              cn(
                'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )
            }
          >
            Enterprise
          </NavLink>
          <NavLink
            to="/company"
            className={({ isActive }) =>
              cn(
                'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )
            }
          >
            Company
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] animate-[fs-slide-up_200ms_ease-out] lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--text)]"
              onClick={() => setProductOpen((v) => !v)}
            >
              Product
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  productOpen && 'rotate-180',
                )}
              />
            </button>
            {productOpen && (
              <div className="ml-2 space-y-0.5 border-l border-[var(--border)] pl-3">
                {productLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--muted)]"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
            {[
              { to: '/pricing', label: 'Pricing' },
              { to: '/developers', label: 'Developers' },
              { to: '/enterprise', label: 'Enterprise' },
              { to: '/company', label: 'Company' },
              ...resourceLinks.slice(0, 4),
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/signup" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
