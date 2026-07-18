import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { SecretReveal } from '@/components/shared/secret-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { webhooksService } from '@/services/webhooks'
import { useAuth } from '@/app/providers/auth-provider'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function WebhookDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const queryClient = useQueryClient()
  const [secret, setSecret] = useState<string | null>(null)

  const endpoint = useQuery({
    queryKey: ['webhooks', id],
    queryFn: async () => (await webhooksService.getEndpoint(id)).data,
    enabled: Boolean(id),
  })

  const deliveries = useQuery({
    queryKey: ['webhook-deliveries', id],
    queryFn: async () =>
      (await webhooksService.listDeliveries({ endpoint_id: id, limit: 50 }))
        .data,
    enabled: Boolean(id),
  })

  const deadLetters = useQuery({
    queryKey: ['webhook-dead-letters'],
    queryFn: async () => (await webhooksService.listDeadLetters()).data,
  })

  const rotate = useMutation({
    mutationFn: () => webhooksService.rotateSecret(id),
    onSuccess: (res) => {
      setSecret(res.data.secret)
      toast.message(res.data.message || 'Secret rotated')
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  const toggle = useMutation({
    mutationFn: (is_active: boolean) =>
      webhooksService.updateEndpoint(id, { is_active }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['webhooks', id] })
      toast.success('Endpoint updated')
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  if (endpoint.isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!endpoint.data) {
    return (
      <div>
        <ErrorAlert
          message={
            endpoint.error
              ? userFacingAuthMessage(toApiError(endpoint.error))
              : 'Endpoint not found'
          }
        />
        <Button asChild variant="outline" className="mt-4">
          <Link to="/webhooks">Back</Link>
        </Button>
      </div>
    )
  }

  const ep = endpoint.data
  const dlForEndpoint = (deadLetters.data ?? []).filter(
    (d) => !d.endpoint_id || d.endpoint_id === id,
  )

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/webhooks">
          <ArrowLeft className="size-4" />
          Webhooks
        </Link>
      </Button>

      <PageHeader
        title={ep.url}
        description={ep.description || ep.id}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant={ep.is_active === false ? 'default' : 'success'}>
              {ep.is_active === false ? 'Inactive' : 'Active'}
            </Badge>
            {ep.circuit_state && (
              <Badge
                variant={
                  ep.circuit_state === 'closed' ? 'outline' : 'warn'
                }
              >
                circuit: {ep.circuit_state}
              </Badge>
            )}
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggle.mutate(ep.is_active === false ? true : false)
                  }
                >
                  {ep.is_active === false ? 'Activate' : 'Deactivate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  loading={rotate.isPending}
                  onClick={() => rotate.mutate()}
                >
                  Rotate secret
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {(ep.subscribed_events ?? []).map((e) => (
          <Badge key={e} variant="outline" className="font-mono text-[10px]">
            {e}
          </Badge>
        ))}
        {ep.include_subject && (
          <Badge variant="warn">include_subject</Badge>
        )}
      </div>

      <Tabs defaultValue="deliveries">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="dead">Dead letters</TabsTrigger>
          <TabsTrigger value="docs">Verify signature</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          {deliveries.isLoading && <Skeleton className="h-32 w-full" />}
          {!deliveries.isLoading && (deliveries.data?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--muted)]">
              No deliveries yet. Send a test email to generate events.
            </p>
          )}
          {(deliveries.data?.length ?? 0) > 0 && (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Event</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Attempt</th>
                    <th className="px-3 py-2 font-medium">HTTP</th>
                    <th className="px-3 py-2 font-medium">Error / body</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                  {(deliveries.data ?? []).map((d) => (
                    <tr key={d.id}>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--muted)]">
                        {formatDate(d.created_at || d.delivered_at)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {d.event_type || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            d.status === 'success' || d.http_status
                              ? Number(d.http_status) < 300
                                ? 'success'
                                : 'danger'
                              : 'default'
                          }
                        >
                          {d.status || '—'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{d.attempt ?? '—'}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {d.http_status ?? '—'}
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-2 text-xs text-[var(--muted)]">
                        {d.error ||
                          (d.response_body
                            ? d.response_body.slice(0, 80)
                            : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dead">
          {dlForEndpoint.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No dead letters for this endpoint.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
              {dlForEndpoint.map((d) => (
                <li key={d.id} className="px-4 py-3 text-sm">
                  <p className="font-mono text-xs">{d.event_type}</p>
                  <p className="mt-1 text-[var(--danger)]">{d.error || '—'}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDate(d.created_at || d.last_attempt_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="docs">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--muted)]">
            <pre className="overflow-x-auto font-mono leading-relaxed text-[var(--text)]">
{`// Node
const crypto = require("crypto");
function verify(req, secret) {
  const ts = req.headers["x-floatsend-timestamp"];
  const sig = (req.headers["x-floatsend-signature"] || "").replace(/^v1=/, "");
  const body = req.rawBody; // Buffer — raw body, do not re-serialize
  const expect = crypto.createHmac("sha256", secret)
    .update(\`\${ts}.\`).update(body).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(sig, "hex"),
    Buffer.from(expect, "hex")
  );
}
// Reject if |now - ts| > 5 minutes; return 2xx quickly`}
            </pre>
            <p className="mt-3">
              Return 2xx for success. 408/429/5xx retry (up to 8). Other 4xx →
              dead-letter.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {secret && (
        <SecretReveal
          secret={secret}
          title="New signing secret"
          message="Previous secret is invalidated. Store this securely."
          onDone={() => setSecret(null)}
        />
      )}
    </div>
  )
}
