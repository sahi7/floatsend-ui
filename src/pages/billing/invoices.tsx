import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { billingService } from '@/services/billing'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCents } from '@/lib/money'
import { formatDate } from '@/lib/utils'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export function BillingInvoicesPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async () =>
      (await billingService.listInvoices({ limit: 50, offset: 0 })).data,
  })

  const generate = useMutation({
    mutationFn: () => billingService.generateInvoice({ force: false }),
    onSuccess: async (res) => {
      toast.success('Invoice generated', {
        description: res.data.invoice_number,
      })
      await queryClient.invalidateQueries({ queryKey: ['billing-invoices'] })
    },
    onError: (e) => toast.error(userFacingAuthMessage(toApiError(e))),
  })

  const invoices = listQuery.data?.invoices ?? []

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/billing">
          <ArrowLeft className="size-4" />
          Billing
        </Link>
      </Button>

      <PageHeader
        title="Invoices"
        description="On-demand invoices. Generate when you need a PDF — not auto-created monthly."
        actions={
          canManage ? (
            <Button
              size="sm"
              loading={generate.isPending}
              onClick={() => generate.mutate()}
            >
              <Plus className="size-3.5" />
              Generate for current period
            </Button>
          ) : undefined
        }
      />

      {listQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!listQuery.isLoading && invoices.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Generate an invoice for the current billing period when you need a receipt or PDF."
          actionLabel={canManage ? 'Generate invoice' : undefined}
          onAction={
            canManage ? () => generate.mutate() : undefined
          }
        />
      )}

      {invoices.length > 0 && (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">Invoice</th>
                <th className="px-3 py-2.5 font-medium">Period</th>
                <th className="px-3 py-2.5 font-medium">Plan</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Amount</th>
                <th className="px-3 py-2.5 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--surface-2)]/40">
                  <td className="px-3 py-2.5">
                    <Link
                      to={`/billing/invoices/${inv.id}`}
                      className="font-mono text-xs text-[var(--accent)] hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--muted)]">
                    {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
                  </td>
                  <td className="px-3 py-2.5">
                    {inv.plan_name || inv.plan_code || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline">{inv.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums font-medium">
                    {formatCents(inv.amount_cents, inv.currency)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--muted)]">
                    {formatDate(inv.issued_at || inv.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
