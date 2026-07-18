import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorAlert } from '@/components/shared/error-alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { billingService } from '@/services/billing'
import { formatCents } from '@/lib/money'
import { formatDate } from '@/lib/utils'
import { downloadInvoicePdf } from '@/lib/invoice-pdf'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export function BillingInvoiceDetailPage() {
  const { id = '' } = useParams()

  const invQuery = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: async () => (await billingService.getInvoice(id)).data,
    enabled: Boolean(id),
  })

  const inv = invQuery.data
  const err = invQuery.error ? toApiError(invQuery.error) : null

  function handlePdf() {
    if (!inv) return
    try {
      downloadInvoicePdf(inv)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Could not generate PDF')
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 print:hidden"
      >
        <Link to="/billing/invoices">
          <ArrowLeft className="size-4" />
          Invoices
        </Link>
      </Button>

      {invQuery.isLoading && <Skeleton className="h-64 w-full" />}

      <ErrorAlert
        error={err}
        message={err ? userFacingAuthMessage(err) : undefined}
        className="mb-4"
      />

      {inv && (
        <>
          <PageHeader
            title={inv.invoice_number}
            description={`Period ${formatDate(inv.period_start)} – ${formatDate(inv.period_end)}`}
            actions={
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="size-3.5" />
                  Print
                </Button>
                <Button size="sm" onClick={handlePdf}>
                  <Download className="size-3.5" />
                  Download PDF
                </Button>
              </div>
            }
          />

          <div className="mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 print:border-0 print:p-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <p className="font-heading text-xl font-semibold">FloatSend</p>
                <p className="text-sm text-[var(--muted)]">Invoice</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-mono text-xs">{inv.invoice_number}</p>
                <p className="text-[var(--muted)]">
                  Issued {formatDate(inv.issued_at || inv.created_at)}
                </p>
                <Badge variant="outline" className="mt-1">
                  {inv.status}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Bill to
                </p>
                <div className="mt-1 space-y-0.5 text-sm">
                  <p className="font-medium">
                    {inv.billing_full_name || '—'}
                  </p>
                  <p className="text-[var(--muted)]">
                    {inv.billing_email || '—'}
                  </p>
                  {inv.billing_address_line1 && (
                    <p className="text-[var(--muted)]">
                      {inv.billing_address_line1}
                    </p>
                  )}
                  {inv.billing_country_or_region && (
                    <p className="text-[var(--muted)]">
                      {inv.billing_country_or_region}
                    </p>
                  )}
                  {inv.billing_tax_id && (
                    <p className="text-[var(--muted)]">
                      Tax ID: {inv.billing_tax_id}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Details
                </p>
                <dl className="mt-1 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted)]">Plan</dt>
                    <dd>{inv.plan_name || inv.plan_code || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[var(--muted)]">Period</dt>
                    <dd className="text-right">
                      {formatDate(inv.period_start)} –{' '}
                      {formatDate(inv.period_end)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-2 font-medium">Description</th>
                    <th className="py-2 px-2 font-medium text-right">Qty</th>
                    <th className="py-2 px-2 font-medium text-right">Unit</th>
                    <th className="py-2 pl-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {(inv.items ?? []).map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-2">{item.description}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {formatCents(item.unit_cents, inv.currency)}
                      </td>
                      <td className="py-2.5 pl-2 text-right tabular-nums">
                        {formatCents(item.amount_cents, inv.currency)}
                      </td>
                    </tr>
                  ))}
                  {(inv.items?.length ?? 0) === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-[var(--muted)]"
                      >
                        No line items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
              <p className="font-heading text-xl font-semibold tabular-nums">
                Total {formatCents(inv.amount_cents, inv.currency)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
