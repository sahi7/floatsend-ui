import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { AppShell } from '@/app/layouts/app-shell'
import { MarketingLayout } from '@/app/layouts/marketing-layout'
import { WelcomePage } from '@/pages/welcome'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { VerifyEmailPage } from '@/pages/auth/verify-email'
import { MfaChallengePage } from '@/pages/auth/mfa-challenge'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
import { HomePage } from '@/pages/home'
import { DomainsListPage } from '@/pages/domains/list'
import { DomainNewPage } from '@/pages/domains/new'
import { DomainDetailPage } from '@/pages/domains/detail'
import { ApiKeysListPage } from '@/pages/api-keys/list'
import { ApiKeyNewPage } from '@/pages/api-keys/new'
import { SendPage } from '@/pages/send'
import { ActivityPage } from '@/pages/activity'
import { InboxListPage } from '@/pages/inbox/list'
import { InboxThreadPage } from '@/pages/inbox/thread'
import { WebhooksListPage } from '@/pages/webhooks/list'
import { WebhookNewPage } from '@/pages/webhooks/new'
import { WebhookDetailPage } from '@/pages/webhooks/detail'
import { SecuritySettingsPage } from '@/pages/settings/security'
import { TeamSettingsPage } from '@/pages/settings/team'
import { BillingPage } from '@/pages/billing'
import { BillingPlansPage } from '@/pages/billing/plans'
import { BillingProfilePage } from '@/pages/billing/profile'
import { BillingInvoicesPage } from '@/pages/billing/invoices'
import { BillingInvoiceDetailPage } from '@/pages/billing/invoice-detail'
import { InvitationPage } from '@/pages/invitations/accept'
import { ContentRoute } from '@/pages/marketing/content-route'
import { PricingPage } from '@/pages/marketing/pricing'
import { useAuth } from '@/app/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'

function PublicWelcome() {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)]">
        <Skeleton className="h-10 w-40" />
      </div>
    )
  }
  if (isAuthenticated && user) {
    if (!user.email_verified) return <Navigate to="/verify-email" replace />
    return <Navigate to="/home" replace />
  }
  return <WelcomePage />
}

function VerifyEmailRoute() {
  return (
    <div className="relative min-h-dvh bg-[var(--bg)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--accent) 14%, transparent), transparent)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center px-4 py-10">
        <div className="animate-[fs-scale-in_250ms_cubic-bezier(0.16,1,0.3,1)] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] sm:p-8">
          <VerifyEmailPage />
        </div>
      </div>
    </div>
  )
}

/** Static marketing / legal / support pages under MarketingLayout */
const marketingSlugs = [
  'features',
  'enterprise',
  'security',
  'reliability',
  'deliverability',
  'developers',
  'solutions',
  'use-cases',
  'customers',
  'integrations',
  'api',
  'docs',
  'changelog',
  'status',
  'roadmap',
  'templates',
  'email-api',
  'webhooks-docs',
  'sdks',
  'careers',
  'company',
  'leadership',
  'contact',
  'offices',
  'press',
  'brand',
  'help',
  'faq',
  'community',
  'trust',
  'compliance',
  'soc',
] as const

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicWelcome />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/mfa" element={<MfaChallengePage />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmailRoute />} />
        <Route path="/invitations/accept" element={<InvitationPage />} />
        <Route path="/invitations/:token" element={<InvitationPage />} />

        {/* Public marketing site — additive routes only */}
        <Route element={<MarketingLayout />}>
          <Route path="/pricing" element={<PricingPage />} />
          {marketingSlugs.map((slug) => (
            <Route
              key={slug}
              path={`/${slug}`}
              element={<ContentRoute slug={slug} />}
            />
          ))}
          <Route
            path="/legal/privacy"
            element={<ContentRoute slug="legal-privacy" />}
          />
          <Route
            path="/legal/terms"
            element={<ContentRoute slug="legal-terms" />}
          />
          <Route
            path="/legal/cookies"
            element={<ContentRoute slug="legal-cookies" />}
          />
          <Route path="/legal/dpa" element={<ContentRoute slug="legal-dpa" />} />
          <Route
            path="/legal/security"
            element={<ContentRoute slug="legal-security" />}
          />
          <Route
            path="/legal/disclosure"
            element={<ContentRoute slug="legal-disclosure" />}
          />
          <Route path="/legal/aup" element={<ContentRoute slug="legal-aup" />} />
          <Route
            path="/legal/gdpr"
            element={<ContentRoute slug="legal-gdpr" />}
          />
          {/* aliases */}
          <Route path="/why" element={<ContentRoute slug="features" />} />
          <Route
            path="/why-floatsend"
            element={<ContentRoute slug="features" />}
          />
          <Route path="/blog" element={<ContentRoute slug="templates" />} />
          <Route path="/support" element={<ContentRoute slug="help" />} />
          <Route path="/health" element={<ContentRoute slug="status" />} />
          <Route
            path="/responsible-disclosure"
            element={<ContentRoute slug="legal-disclosure" />}
          />
        </Route>

        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/onboarding" element={<Navigate to="/home" replace />} />
          <Route path="/domains" element={<DomainsListPage />} />
          <Route path="/domains/new" element={<DomainNewPage />} />
          <Route path="/domains/:id" element={<DomainDetailPage />} />
          <Route path="/api-keys" element={<ApiKeysListPage />} />
          <Route path="/api-keys/new" element={<ApiKeyNewPage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/inbox" element={<InboxListPage />} />
          <Route path="/inbox/:id" element={<InboxThreadPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/logs" element={<Navigate to="/activity" replace />} />
          <Route path="/webhooks" element={<WebhooksListPage />} />
          <Route path="/webhooks/new" element={<WebhookNewPage />} />
          <Route path="/webhooks/:id" element={<WebhookDetailPage />} />
          <Route path="/settings/security" element={<SecuritySettingsPage />} />
          <Route path="/settings/team" element={<TeamSettingsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/billing/plans" element={<BillingPlansPage />} />
          <Route path="/billing/profile" element={<BillingProfilePage />} />
          <Route path="/billing/invoices" element={<BillingInvoicesPage />} />
          <Route
            path="/billing/invoices/:id"
            element={<BillingInvoiceDetailPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
