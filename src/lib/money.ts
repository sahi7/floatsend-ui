export function formatCents(
  cents: number | null | undefined,
  currency = 'usd',
): string {
  const n = typeof cents === 'number' ? cents : 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(n / 100)
}

export function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}
