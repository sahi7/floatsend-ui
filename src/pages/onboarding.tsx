import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  Circle,
  Globe,
  KeyRound,
  Mail,
  Send,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { PageHeader } from '@/components/shared/page-header'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { domainsService } from '@/services/domains'
import { apiKeysService } from '@/services/api-keys'
import {
  getFirstSendDone,
  getOnboardingSkipped,
  setOnboardingSkipped,
} from '@/lib/onboarding'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const domainsQuery = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data } = await domainsService.list()
      return data
    },
  })

  const keysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await apiKeysService.list()
      return data
    },
  })

  const loading = domainsQuery.isLoading || keysQuery.isLoading

  const hasVerifiedDomain = (domainsQuery.data?.domains ?? []).some(
    (d) => d.status === 'verified',
  )
  const activeKeys = (keysQuery.data?.api_keys ?? []).filter(
    (k) => k.is_active || k.status === 'active',
  )
  const hasActiveTestKey = activeKeys.some((k) => k.type === 'test')
  const hasSendableDomain = (domainsQuery.data?.domains ?? []).some(
    (d) => d.can_send === true,
  )
  // New accounts must create a test key before sending test messages.
  const canAccessSend = hasSendableDomain
    ? activeKeys.length > 0
    : hasActiveTestKey
  const emailVerified = Boolean(user?.email_verified)
  const firstSend = user?.org_id ? getFirstSendDone(user.org_id) : false

  const steps = [
    {
      id: 'email',
      title: 'Verify your email',
      description: 'Confirm the email address on your account',
      done: emailVerified,
      href: '/verify-email',
      icon: Mail,
      cta: 'Verify',
    },
    {
      id: 'domain',
      title: 'Add a sending domain',
      description: 'Prove you own the domain and finish DNS setup',
      done: hasVerifiedDomain,
      href: '/domains/new',
      icon: Globe,
      cta: 'Add domain',
    },
    {
      id: 'key',
      title: 'Create a test API key',
      description: 'Required before you can send test messages',
      done: canAccessSend,
      href: '/api-keys/new',
      icon: KeyRound,
      cta: 'Create key',
    },
    {
      id: 'send',
      title: 'Send a test email',
      description: canAccessSend
        ? 'Send a message to confirm everything works'
        : 'Create a test API key first, then send a message',
      done: firstSend,
      href: canAccessSend ? '/send' : '/api-keys/new',
      icon: Send,
      cta: canAccessSend ? 'Send test' : 'Create key first',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const allDone = doneCount === steps.length

  function handleSkip() {
    if (user?.org_id) setOnboardingSkipped(user.org_id)
    navigate('/domains')
  }

  return (
    <div>
      <PageHeader
        title={user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome'}
        description="Complete these steps to start sending email."
        actions={
          <Badge variant="outline" className="text-xs capitalize">
            {user?.role || 'member'}
          </Badge>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-sm font-semibold">
                  Setup progress
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {doneCount} of {steps.length} complete
                </p>
              </div>
              <span className="font-heading text-2xl font-semibold tabular-nums text-[var(--accent)]">
                {progress}%
              </span>
            </div>
            <Progress value={progress} aria-label="Onboarding progress" />
          </div>

          <ul className="space-y-3">
            {steps.map((step) => (
              <li key={step.id}>
                <div
                  className={cn(
                    'flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between',
                    step.done
                      ? 'border-[var(--success)]/30'
                      : 'border-[var(--border)]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border',
                        step.done
                          ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
                          : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]',
                      )}
                      aria-hidden
                    >
                      {step.done ? (
                        <Check className="size-4" />
                      ) : (
                        <Circle className="size-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <step.icon
                          className="size-3.5 text-[var(--muted)]"
                          aria-hidden
                        />
                        <h2 className="font-heading text-sm font-semibold">
                          {step.title}
                        </h2>
                        {step.done && (
                          <span className="text-xs text-[var(--success)]">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {!step.done && (
                    <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
                      <Link to={step.href}>
                        {step.cta}
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {(emailVerified || allDone) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {allDone ? (
                <Button asChild>
                  <Link to="/domains">Go to dashboard</Link>
                </Button>
              ) : (
                emailVerified &&
                !getOnboardingSkipped(user?.org_id || '') && (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip for now
                  </Button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
