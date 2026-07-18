import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { CopyButton } from '@/components/shared/copy-button'
import { OtpInput } from '@/components/shared/otp-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { authService } from '@/services/auth'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { formatDate, formatRelative } from '@/lib/utils'
import { toast } from 'sonner'
import type { SessionView } from '@/types/api'

function normalizeSessions(
  data: SessionView[] | { sessions: SessionView[] },
): SessionView[] {
  if (Array.isArray(data)) return data
  return data.sessions ?? []
}

export function SecuritySettingsPage() {
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<ApiError | null>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // MFA enroll
  const [enroll, setEnroll] = useState<{
    secret: string
    otpauth_url: string
  } | null>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [disableCode, setDisableCode] = useState('')
  const [disableOpen, setDisableOpen] = useState(false)

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await authService.listSessions()
      return normalizeSessions(data)
    },
  })

  const changePassword = useMutation({
    mutationFn: () =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setApiError(null)
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const startEnroll = useMutation({
    mutationFn: () => authService.mfaEnroll(),
    onSuccess: (res) => {
      setEnroll(res.data)
      setApiError(null)
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const confirmMfa = useMutation({
    mutationFn: () => authService.mfaConfirm(confirmCode),
    onSuccess: async (res) => {
      setRecoveryCodes(res.data.recovery_codes)
      setEnroll(null)
      setConfirmCode('')
      await refreshUser()
      toast.success('MFA enabled')
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const disableMfa = useMutation({
    mutationFn: () => authService.mfaDisable({ code: disableCode }),
    onSuccess: async () => {
      setDisableOpen(false)
      setDisableCode('')
      await refreshUser()
      toast.success('MFA disabled')
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const revokeSession = useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session revoked')
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  const revokeAll = useMutation({
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Other sessions revoked')
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  return (
    <div className="space-y-10">
      <PageHeader
        title="Security"
        description="Sessions, password, and multi-factor authentication."
      />

      <ErrorAlert
        error={apiError}
        message={apiError ? userFacingAuthMessage(apiError) : undefined}
      />

      {/* Password */}
      <section className="max-w-md space-y-4">
        <h2 className="font-heading text-base font-semibold">Password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button
          loading={changePassword.isPending}
          disabled={!currentPassword || newPassword.length < 8}
          onClick={() => changePassword.mutate()}
        >
          Update password
        </Button>
      </section>

      <Separator />

      {/* MFA */}
      <section className="max-w-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Two-factor authentication
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Status:{' '}
              <span className="text-[var(--text)]">
                {user?.mfa_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
          {user?.mfa_enabled ? (
            <Button variant="danger-outline" onClick={() => setDisableOpen(true)}>
              Disable MFA
            </Button>
          ) : (
            !enroll && (
              <Button
                loading={startEnroll.isPending}
                onClick={() => startEnroll.mutate()}
              >
                Enable MFA
              </Button>
            )
          )}
        </div>

        {enroll && (
          <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--muted)]">
              Scan this QR with your authenticator app, or enter the secret
              manually.
            </p>
            <div className="flex justify-center rounded-[var(--radius-md)] bg-white p-4">
              <QRCodeSVG value={enroll.otpauth_url} size={160} />
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-xs">
                {enroll.secret}
              </code>
              <CopyButton value={enroll.secret} size="icon" />
            </div>
            <div className="space-y-2">
              <Label>Confirm code</Label>
              <OtpInput value={confirmCode} onChange={setConfirmCode} />
            </div>
            <Button
              loading={confirmMfa.isPending}
              disabled={confirmCode.length !== 6}
              onClick={() => confirmMfa.mutate()}
            >
              Confirm and enable
            </Button>
          </div>
        )}

        {recoveryCodes && (
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--warn)]/40 bg-[var(--warn-soft)] p-5">
            <h3 className="font-heading font-semibold text-[var(--warn)]">
              Recovery codes — save now
            </h3>
            <p className="text-sm text-[var(--muted)]">
              These will not be shown again.
            </p>
            <ul className="grid gap-1 font-mono text-sm sm:grid-cols-2">
              {recoveryCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <CopyButton value={recoveryCodes.join('\n')} label="Copy all" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([recoveryCodes.join('\n')], {
                    type: 'text/plain',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'floatsend-recovery-codes.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Download
              </Button>
              <Button size="sm" onClick={() => setRecoveryCodes(null)}>
                I saved them
              </Button>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Sessions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold">Sessions</h2>
          <Button
            variant="outline"
            size="sm"
            loading={revokeAll.isPending}
            onClick={() => revokeAll.mutate()}
          >
            Revoke all others
          </Button>
        </div>

        {sessionsQuery.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
          {(sessionsQuery.data ?? []).map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {session.device_name || 'Unknown device'}
                  {session.current && (
                    <span className="ml-2 text-xs text-[var(--accent)]">
                      Current
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {session.ip && `${session.ip} · `}
                  Created {formatDate(session.created_at)}
                  {session.last_used_at &&
                    ` · Active ${formatRelative(session.last_used_at)}`}
                </p>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start text-[var(--danger)]"
                  onClick={() => revokeSession.mutate(session.id)}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
          {!sessionsQuery.isLoading &&
            (sessionsQuery.data?.length ?? 0) === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                No sessions found.
              </li>
            )}
        </ul>
      </section>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable MFA</DialogTitle>
            <DialogDescription>
              Enter a current authenticator code to disable two-factor
              authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <OtpInput value={disableCode} onChange={setDisableCode} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={disableMfa.isPending}
              disabled={disableCode.length !== 6}
              onClick={() => disableMfa.mutate()}
            >
              Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
