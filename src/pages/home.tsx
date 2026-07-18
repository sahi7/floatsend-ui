import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  Globe,
  KeyRound,
  Mail,
  Send,
  Webhook,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { PageHeader } from '@/components/shared/page-header'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { domainsService } from '@/services/domains'
import { apiKeysService } from '@/services/api-keys'
import { emailsService, logRecipient } from '@/services/emails'
import {
  getFirstSendDone,
  getOnboardingSkipped,
  setOnboardingSkipped,
} from '@/lib/onboarding'
import { cn, formatRelative } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { StatusChip } from '@/components/shared/status-chip'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const domainsQuery = useQuery({
    queryKey: ['domains'],
    queryFn: async () => (await domainsService.list()).data,
  })

  const keysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => (await apiKeysService.list()).data,
  })

  const previewQuery = useQuery({
    queryKey: ['email-logs-preview'],
    queryFn: async () => (await emailsService.dashboardPreview('7d')).data,
    refetchInterval: 20_000,
  })

  const loading = domainsQuery.isLoading || keysQuery.isLoading

  const hasSendableDomain = (domainsQuery.data?.domains ?? []).some(
    (d) => d.can_send === true,
  )
  const capacityBlocked = (domainsQuery.data?.domains ?? []).some(
    (d) => d.ses_status === 'capacity_blocked',
  )
  const activeKeys = (keysQuery.data?.api_keys ?? []).filter(
    (k) => k.is_active || k.status === 'active',
  )
  const hasActiveTestKey = activeKeys.some((k) => k.type === 'test')
  // New accounts (no ready domain) must create a test key before sending.
  const canAccessSend = hasSendableDomain
    ? activeKeys.length > 0
    : hasActiveTestKey
  const emailVerified = Boolean(user?.email_verified)
  const firstSend = user?.org_id ? getFirstSendDone(user.org_id) : false

  const steps = [
    {
      id: 'email',
      title: 'Verify your email',
      done: emailVerified,
      href: '/verify-email',
      icon: Mail,
      cta: 'Verify',
    },
    {
      id: 'domain',
      title: 'Add a sending domain',
      done: hasSendableDomain,
      href: '/domains/new',
      icon: Globe,
      cta: 'Add domain',
    },
    {
      id: 'key',
      title: 'Create a test API key',
      done: canAccessSend,
      href: '/api-keys/new',
      icon: KeyRound,
      cta: 'Create key',
    },
    {
      id: 'send',
      title: 'Send a test email',
      done: firstSend,
      href: canAccessSend ? '/send' : '/api-keys/new',
      icon: Send,
      cta: canAccessSend ? 'Send test' : 'Create key first',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const allDone = doneCount === steps.length
  const recent = previewQuery.data?.logs ?? []

  return (
    <div className="space-y-8">
      <PageHeader
        title={user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Home'}
        description="Your recent sends and setup checklist."
        actions={
          <Badge variant="outline" className="text-xs capitalize">
            {user?.role || 'member'}
          </Badge>
        }
      />

      {capacityBlocked && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Sending is temporarily limited. We are restoring full capacity.
          </p>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">Recent sends</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/activity">
              View activity
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {previewQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : recent.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-[var(--muted)]">
              No recent sends.{' '}
              <Link to="/send" className="text-[var(--accent)] underline">
                Send a test email
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            {recent.slice(0, 5).map((log) => (
              <li
                key={String(log.id || log.message_id)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {logRecipient(log)}
                  </p>
                  <p className="text-xs text-[var(--muted-2)]">
                    {formatRelative(
                      String(log.created_at || log.sent_at || ''),
                    )}
                  </p>
                </div>
                <StatusChip status={String(log.status || 'unknown')} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Onboarding checklist */}
      <section>
        <h2 className="mb-3 font-heading text-sm font-semibold">Setup</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {!hasSendableDomain && (
              <div
                role="status"
                className="mb-4 rounded-[var(--radius-md)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-3 py-2.5 text-sm text-[var(--warn)]"
              >
                To send from your own address, add and verify a domain. Until
                then you can send test messages to your account email with a
                test API key.
              </div>
            )}

            <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-[var(--muted)]">
                  {doneCount} of {steps.length} complete
                </p>
                <span className="font-heading text-lg font-semibold text-[var(--accent)]">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} />
            </div>

            <ul className="space-y-2">
              {steps.map((step) => (
                <li key={step.id}>
                  <div
                    className={cn(
                      'flex flex-col gap-2 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between',
                      step.done
                        ? 'border-[var(--success)]/30'
                        : 'border-[var(--border)]',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-7 items-center justify-center rounded-full border',
                          step.done
                            ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
                            : 'border-[var(--border)] text-[var(--muted)]',
                        )}
                      >
                        {step.done ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Circle className="size-3" />
                        )}
                      </div>
                      <step.icon className="size-3.5 text-[var(--muted)]" />
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {!step.done && (
                      <Button asChild size="sm">
                        <Link to={step.href}>{step.cta}</Link>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/webhooks">
                  <Webhook className="size-3.5" />
                  Webhooks
                </Link>
              </Button>
              {emailVerified && !allDone && !getOnboardingSkipped(user?.org_id || '') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (user?.org_id) setOnboardingSkipped(user.org_id)
                    navigate('/domains')
                  }}
                >
                  Skip for now
                </Button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}


