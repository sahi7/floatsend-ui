import { Badge } from '@/components/ui/badge'
import type { DomainStatus } from '@/types/api'

const domainStatusMap: Record<
  string,
  { label: string; variant: 'success' | 'warn' | 'danger' | 'default' | 'accent' }
> = {
  verified: { label: 'Verified', variant: 'success' },
  ownership_pending: { label: 'Ownership pending', variant: 'warn' },
  pending: { label: 'Pending', variant: 'warn' },
  dns_pending: { label: 'DNS pending', variant: 'warn' },
  suspended: { label: 'Suspended', variant: 'danger' },
  expired: { label: 'Expired', variant: 'danger' },
  revoked: { label: 'Revoked', variant: 'default' },
  deleted: { label: 'Deleted', variant: 'default' },
  active: { label: 'Active', variant: 'success' },
  live: { label: 'Live', variant: 'accent' },
  test: { label: 'Test', variant: 'default' },
  // Email identity setup
  none: { label: 'Not started', variant: 'default' },
  pending_create: { label: 'Setting up', variant: 'warn' },
  pending_dns: { label: 'DNS pending', variant: 'warn' },
  failed: { label: 'Failed', variant: 'danger' },
  capacity_blocked: { label: 'Temporarily unavailable', variant: 'danger' },
  // Email delivery
  accepted: { label: 'Accepted', variant: 'default' },
  queued: { label: 'Queued', variant: 'default' },
  processing: { label: 'Sending', variant: 'warn' },
  provider_accepted: { label: 'Sent', variant: 'success' },
  delivered: { label: 'Delivered', variant: 'success' },
  bounced: { label: 'Bounced', variant: 'danger' },
  complained: { label: 'Complaint', variant: 'danger' },
  suppressed: { label: 'Suppressed', variant: 'warn' },
  unsubscribed: { label: 'Unsubscribed', variant: 'default' },
}

export function StatusChip({
  status,
  label,
}: {
  status: DomainStatus | string
  label?: string
}) {
  const mapped = domainStatusMap[status] ?? {
    label: status,
    variant: 'default' as const,
  }
  const variant =
    mapped.variant === ('accent' as string) ? 'accent' : mapped.variant

  return (
    <Badge variant={variant as 'success' | 'warn' | 'danger' | 'default' | 'accent'}>
      <span className="sr-only">Status: </span>
      {label ?? mapped.label}
    </Badge>
  )
}
