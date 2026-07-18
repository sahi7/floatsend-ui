import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { organizationsService } from '@/services/organizations'
import { useAuth } from '@/app/providers/auth-provider'
import { ApiError, toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import type { InvitationView, MemberView, OrgRole } from '@/types/api'
import { cn } from '@/lib/utils'

function normalizeMembers(
  data: MemberView[] | { members: MemberView[] },
): MemberView[] {
  if (Array.isArray(data)) return data
  return data.members ?? []
}

function normalizeInvites(
  data: InvitationView[] | { invitations: InvitationView[] },
): InvitationView[] {
  if (Array.isArray(data)) return data
  return data.invitations ?? []
}

export function TeamSettingsPage() {
  const { user } = useAuth()
  const orgId = user?.org_id || ''
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')

  const canManage =
    user?.role === 'owner' || user?.role === 'admin'

  const membersQuery = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const { data } = await organizationsService.listMembers(orgId)
      return normalizeMembers(data)
    },
    enabled: Boolean(orgId),
  })

  const invitesQuery = useQuery({
    queryKey: ['invitations', orgId],
    queryFn: async () => {
      const { data } = await organizationsService.listInvitations(orgId)
      return normalizeInvites(data)
    },
    enabled: Boolean(orgId) && canManage,
  })

  const inviteMutation = useMutation({
    mutationFn: () =>
      organizationsService.createInvitation(orgId, { email, role }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['invitations', orgId] })
      toast.success('Invitation sent')
      if (res.data.debug_token) {
        toast.message('Debug invite token', {
          description: res.data.debug_token,
        })
      }
      setInviteOpen(false)
      setEmail('')
      setApiError(null)
    },
    onError: (err) => setApiError(toApiError(err)),
  })

  const revokeInvite = useMutation({
    mutationFn: (id: string) =>
      organizationsService.revokeInvitation(orgId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invitations', orgId] })
      toast.success('Invitation revoked')
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  const removeMember = useMutation({
    mutationFn: (userId: string) =>
      organizationsService.removeMember(orgId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      toast.success('Member removed')
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      organizationsService.updateMemberRole(orgId, userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      toast.success('Role updated')
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage members and invitations for this workspace."
        actions={
          canManage ? (
            <Button onClick={() => setInviteOpen(true)}>Invite member</Button>
          ) : undefined
        }
      />

      <ErrorAlert
        error={apiError}
        message={apiError ? userFacingAuthMessage(apiError) : undefined}
      />

      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold">Members</h2>
        {membersQuery.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {!membersQuery.isLoading &&
          (membersQuery.data?.length ?? 0) === 0 && (
            <EmptyState
              icon={Users}
              title="No members"
              description="Invite teammates to collaborate."
            />
          )}
        <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
          {(membersQuery.data ?? []).map((member) => (
            <li
              key={member.user_id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {member.name || member.email || member.user_id}
                </p>
                {member.email && member.name && (
                  <p className="text-xs text-[var(--muted)]">{member.email}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canManage && member.role !== 'owner' ? (
                  <select
                    className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs"
                    value={member.role}
                    onChange={(e) =>
                      updateRole.mutate({
                        userId: member.user_id,
                        role: e.target.value as OrgRole,
                      })
                    }
                    aria-label={`Role for ${member.email || member.user_id}`}
                  >
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                ) : (
                  <Badge variant="outline">{member.role}</Badge>
                )}
                {canManage &&
                  member.role !== 'owner' &&
                  member.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--danger)]"
                      onClick={() => removeMember.mutate(member.user_id)}
                    >
                      Remove
                    </Button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {canManage && (
        <section className="space-y-3">
          <h2 className="font-heading text-base font-semibold">
            Pending invitations
          </h2>
          {invitesQuery.isLoading && <Skeleton className="h-14 w-full" />}
          <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            {(invitesQuery.data ?? []).map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-xs text-[var(--muted)]">
                    Role: {inv.role}
                    {inv.status ? ` · ${inv.status}` : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeInvite.mutate(inv.id)}
                >
                  Revoke
                </Button>
              </li>
            ))}
            {!invitesQuery.isLoading &&
              (invitesQuery.data?.length ?? 0) === 0 && (
                <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                  No pending invitations.
                </li>
              )}
          </ul>
        </section>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email with an accept link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] p-1">
                {(['member', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'rounded-[var(--radius-sm)] px-3 py-1 text-sm capitalize',
                      role === r
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--muted)]',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={inviteMutation.isPending}
              disabled={!email.includes('@')}
              onClick={() => inviteMutation.mutate()}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
