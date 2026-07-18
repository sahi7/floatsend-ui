import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function formatRelative(value?: string | null) {
  if (!value) return 'Never'
  try {
    const date = new Date(value)
    const diff = date.getTime() - Date.now()
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    const abs = Math.abs(diff)
    if (abs < 60_000) return rtf.format(Math.round(diff / 1000), 'second')
    if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute')
    if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour')
    if (abs < 2_592_000_000) return rtf.format(Math.round(diff / 86_400_000), 'day')
    return formatDate(value)
  } catch {
    return value
  }
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function getDeviceName() {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Web browser'
}
