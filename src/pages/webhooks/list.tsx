import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Webhook } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SecretReveal } from '@/components/shared/secret-reveal'
import { webhooksService } from '@/services/webhooks'
import { useAuth } from '@/app/providers/auth-provider'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'
import type { WebhookEndpoint } from '@/types/api'

export function WebhooksListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpoint | null>(null)
  const [secretReveal, setSecretReveal] = useState<string | null>(null)

  const list = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => (await webhooksService.listEndpoints()).data,
  })

  const ordering = useQuery({
    queryKey: ['webhooks-ordering'],
    queryFn: async () => (await webhooksService.getOrdering()).data,
  })

  const del = useMutation({
    mutationFn: (id: string) => webhooksService.deleteEndpoint(id),
    onSuccess: async () => {
      toast.success('Endpoint deleted')
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  const rotate = useMutation({
    mutationFn: (id: string) => webhooksService.rotateSecret(id),
    onSuccess: (res) => {
      setSecretReveal(res.data.secret)
      toast.message(res.data.message || 'New secret generated')
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  const endpoints = list.data ?? []

  return (
    <div>
      <PageHeader
        title="Webhooks"
        description="Get notified when messages are delivered, bounce, or fail."
        actions={
          canManage ? (
            <Button asChild>
              <Link to="/webhooks/new">
                <Plus className="size-4" />
                Add endpoint
              </Link>
            </Button>
          ) : undefined
        }
      />

      {ordering.data?.description && (
        <p className="mb-4 text-xs text-[var(--muted)]">
          {ordering.data.description}
        </p>
      )}

      {list.isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!list.isLoading && endpoints.length === 0 && (
        <EmptyState
          icon={Webhook}
          title="No webhook endpoints"
          description="Create an endpoint to receive email.failed, bounce, and delivery events."
          actionLabel={canManage ? 'Add endpoint' : undefined}
          onAction={canManage ? () => navigate('/webhooks/new') : undefined}
        />
      )}

      {endpoints.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
          {endpoints.map((ep) => (
            <li
              key={ep.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/webhooks/${ep.id}`}
                    className="truncate font-medium hover:text-[var(--accent)]"
                  >
                    {ep.url}
                  </Link>
                  <Badge variant={ep.is_active === false ? 'default' : 'success'}>
                    {ep.is_active === false ? 'Inactive' : 'Active'}
                  </Badge>
                  {ep.circuit_state && ep.circuit_state !== 'closed' && (
                    <Badge variant="warn">{ep.circuit_state}</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {(ep.subscribed_events ?? []).slice(0, 4).join(', ')}
                  {(ep.subscribed_events?.length ?? 0) > 4 &&
                    ` +${ep.subscribed_events.length - 4}`}
                  {ep.description ? ` · ${ep.description}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/webhooks/${ep.id}`}>Details</Link>
                </Button>
                {canManage && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={rotate.isPending}
                      onClick={() => rotate.mutate(ep.id)}
                    >
                      Rotate secret
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--danger)]"
                      onClick={() => setDeleteTarget(ep)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--muted)]">
        <p className="font-heading text-sm font-semibold text-[var(--text)]">
          Signature verification
        </p>
        <pre className="mt-2 overflow-x-auto font-mono leading-relaxed">
{`signed_payload = "{timestamp}." + raw_body
expected = hex(HMAC_SHA256(secret, signed_payload))
header   = "v1=" + expected
// Reject if |now - timestamp| > 5 minutes`}
        </pre>
        <p className="mt-2">
          Headers: <code>X-Floatsend-Timestamp</code>,{' '}
          <code>X-Floatsend-Signature</code>,{' '}
          <code>X-Floatsend-Event-Type</code>
        </p>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete endpoint?</DialogTitle>
            <DialogDescription>
              FloatSend will stop POSTing events to {deleteTarget?.url}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() => deleteTarget && del.mutate(deleteTarget.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {secretReveal && (
        <SecretReveal
          secret={secretReveal}
          title="Webhook signing secret"
          message="Store the secret securely; it will not be shown again."
          onDone={() => setSecretReveal(null)}
        />
      )}
    </div>
  )
}
