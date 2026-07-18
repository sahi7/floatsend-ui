import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/logo'

const columns: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/email-api', label: 'Email API' },
      { to: '/webhooks-docs', label: 'Webhooks' },
      { to: '/sdks', label: 'SDKs' },
      { to: '/integrations', label: 'Integrations' },
      { to: '/templates', label: 'Templates' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { to: '/docs', label: 'Documentation' },
      { to: '/api', label: 'API Overview' },
      { to: '/developers', label: 'Developer Experience' },
      { to: '/changelog', label: 'Changelog' },
      { to: '/roadmap', label: 'Roadmap' },
      { to: '/status', label: 'System Status' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/deliverability', label: 'Deliverability' },
      { to: '/security', label: 'Security' },
      { to: '/reliability', label: 'Reliability' },
      { to: '/use-cases', label: 'Use Cases' },
      { to: '/solutions', label: 'Solutions' },
      { to: '/customers', label: 'Customers' },
      { to: '/help', label: 'Help Center' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/company', label: 'About' },
      { to: '/leadership', label: 'Leadership' },
      { to: '/careers', label: 'Careers' },
      { to: '/contact', label: 'Contact' },
      { to: '/offices', label: 'Offices' },
      { to: '/press', label: 'Press' },
      { to: '/brand', label: 'Brand Assets' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/legal/privacy', label: 'Privacy' },
      { to: '/legal/terms', label: 'Terms' },
      { to: '/legal/cookies', label: 'Cookies' },
      { to: '/legal/dpa', label: 'DPA' },
      { to: '/legal/security', label: 'Security Policy' },
      { to: '/legal/aup', label: 'Acceptable Use' },
      { to: '/legal/gdpr', label: 'GDPR' },
      { to: '/trust', label: 'Trust Center' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Transactional email infrastructure for engineering teams.
            </p>
            <div className="mt-6 space-y-1 text-xs text-[var(--muted-2)]">
              <p>Douala, Cameroon</p>
              <p>Delaware, United States</p>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-heading text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-[var(--muted)] transition-colors duration-150 hover:text-[var(--text)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted-2)]">
            © {new Date().getFullYear()} FloatSend. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
            <Link to="/status" className="hover:text-[var(--text)] transition-colors">
              Status
            </Link>
            <Link to="/docs" className="hover:text-[var(--text)] transition-colors">
              Docs
            </Link>
            <Link to="/legal/privacy" className="hover:text-[var(--text)] transition-colors">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-[var(--text)] transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-[var(--text)] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
