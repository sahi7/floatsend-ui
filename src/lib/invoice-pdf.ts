import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCents } from '@/lib/money'
import type { BillingInvoice } from '@/types/billing'

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

/** Client-side PDF from invoice detail (no PDF binary from API). */
export function downloadInvoicePdf(invoice: BillingInvoice) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('FloatSend', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Invoice', margin, y + 16)

  doc.setTextColor(20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(invoice.invoice_number || invoice.id, 400, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Issued ${fmtDate(invoice.issued_at || invoice.created_at)}`, 400, y + 14, {
    align: 'right',
  })
  doc.text(`Status: ${invoice.status || 'issued'}`, 400, y + 28, {
    align: 'right',
  })

  y += 56
  doc.setTextColor(20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Bill to', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 16
  const billLines = [
    invoice.billing_full_name,
    invoice.billing_email,
    invoice.billing_address_line1,
    invoice.billing_country_or_region,
    invoice.billing_tax_id ? `Tax ID: ${invoice.billing_tax_id}` : '',
  ].filter(Boolean) as string[]
  for (const line of billLines) {
    doc.text(line, margin, y)
    y += 14
  }

  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Period', margin, y)
  doc.setFont('helvetica', 'normal')
  y += 14
  doc.text(
    `${fmtDate(invoice.period_start)} – ${fmtDate(invoice.period_end)}`,
    margin,
    y,
  )
  if (invoice.plan_name || invoice.plan_code) {
    y += 14
    doc.text(`Plan: ${invoice.plan_name || invoice.plan_code}`, margin, y)
  }

  y += 20
  const items = invoice.items ?? []
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Unit', 'Amount']],
    body: items.map((it) => [
      it.description,
      String(it.quantity),
      formatCents(it.unit_cents, invoice.currency),
      formatCents(it.amount_cents, invoice.currency),
    ]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [18, 24, 33], textColor: 243 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20)
  doc.text(
    `Total ${formatCents(invoice.amount_cents, invoice.currency)}`,
    400,
    finalY + 28,
    { align: 'right' },
  )

  if (invoice.notes) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(`Notes: ${invoice.notes}`, margin, finalY + 48, {
      maxWidth: 500,
    })
  }

  doc.save(`${invoice.invoice_number || invoice.id}.pdf`)
}
