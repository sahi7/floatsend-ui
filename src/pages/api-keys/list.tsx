import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, MoreHorizontal, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SecretReveal } from '@/pages/api-keys/secret-reveal'
import { apiKeysService } from '@/services/api-keys'
import { formatRelative } from '@/lib/utils'
import { toast } from 'sonner'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import type { ApiKeyView } from '@/types/api'

export function ApiKeysListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState<{
    type: 'revoke' | 'rotate'
    key: ApiKeyView
  } | null>(null)
  const [rawReveal, setRawReveal] = useState<{
    raw: string
    message?: string
  } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await apiKeysService.list()
      return res.data
    },
  })

  const keys = data?.api_keys ?? []

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key revoked')
      setConfirm(null)
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  const rotateMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.rotate(id),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setConfirm(null)
      setRawReveal({ raw: res.data.raw_key, message: res.data.message })
    },
    onError: (err) => toast.error(userFacingAuthMessage(toApiError(err))),
  })

  return (
    <div>
      <PageHeader
        title="API keys"
        description="Keys your apps use to send email. Create a test key before sending test messages."
        actions={
          <Button asChild>
            <Link to="/api-keys/new">
              <Plus className="size-4" />
              Create key
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isLoading && keys.length === 0 && (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create a test API key to send test messages, then add live keys when you go to production."
          actionLabel="Create test key"
          onAction={() => navigate('/api-keys/new')}
        />
      )}

      {!isLoading && keys.length > 0 && (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Prefix</th>
                <th className="px-4 py-3 font-medium">Permissions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-[var(--surface-2)]/50">
                  <td className="px-4 py-3 font-medium">{key.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={key.type === 'live' ? 'accent' : 'default'}>
                      {key.type === 'live' ? 'Live' : 'Test'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {key.key_prefix}…
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {(key.scopes ?? []).slice(0, 2).map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {(key.scopes?.length ?? 0) > 2 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{key.scopes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip
                      status={key.is_active ? 'active' : key.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatRelative(key.last_used_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirm({ type: 'rotate', key })
                          }
                        >
                          Rotate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() =>
                            setConfirm({ type: 'revoke', key })
                          }
                        >
                          Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(confirm)} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.type === 'rotate' ? 'Rotate key?' : 'Revoke key?'}
            </DialogTitle>
            <DialogDescription>
              Apps that use <strong>{confirm?.key.name}</strong> will stop
              working until you update them with a new key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={
                revokeMutation.isPending || rotateMutation.isPending
              }
              onClick={() => {
                if (!confirm) return
                if (confirm.type === 'revoke') {
                  revokeMutation.mutate(confirm.key.id)
                } else {
                  rotateMutation.mutate(confirm.key.id)
                }
              }}
            >
              {confirm?.type === 'rotate' ? 'Rotate' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {rawReveal && (
        <SecretReveal
          rawKey={rawReveal.raw}
          message={rawReveal.message}
          onDone={() => setRawReveal(null)}
        />
      )}
    </div>
  )
}
