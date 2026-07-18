/** Client-side From/To policy gates (backend still enforces). */

export type SendMode = 'production' | 'platform_shared'

/** Primary platform From default (V9) */
export const PLATFORM_SHARED_FROM =
  import.meta.env.VITE_PLATFORM_SHARED_FROM?.split(',')[0]?.trim() ||
  'mail@floatsend.com'

/** Fixed display name for platform shared test sends (not user-editable) */
export const PLATFORM_SHARED_FROM_NAME = 'FloatSend'

/** Domains allowed for pre-verify testing */
export const PLATFORM_SHARED_DOMAINS: string[] = (
  import.meta.env.VITE_PLATFORM_SHARED_DOMAINS ||
  'floatsend.com,mail.floatsend.com'
)
  .split(',')
  .map((d: string) => d.trim().toLowerCase())
  .filter(Boolean)

export const DEFAULT_FROM_DOMAIN =
  PLATFORM_SHARED_DOMAINS[0] || 'floatsend.com'

/**
 * Parse RFC-style From values, including display-name form:
 *   "Display Name" <sender@example.com>
 */
export interface ParsedMailbox {
  raw: string
  displayName: string | null
  email: string | null
  local: string | null
  domain: string | null
}

export function parseMailbox(input: string): ParsedMailbox {
  const raw = input.trim()
  if (!raw) {
    return {
      raw: '',
      displayName: null,
      email: null,
      local: null,
      domain: null,
    }
  }

  const angle = raw.match(/^(?:"([^"]*)"|([^<]*?))\s*<\s*([^>]+)\s*>\s*$/)
  if (angle) {
    const displayName = (angle[1] ?? angle[2] ?? '').trim() || null
    const email = angle[3].trim()
    const at = email.lastIndexOf('@')
    if (at < 1) {
      return { raw, displayName, email, local: null, domain: null }
    }
    return {
      raw,
      displayName,
      email,
      local: email.slice(0, at),
      domain: email.slice(at + 1).toLowerCase(),
    }
  }

  const at = raw.lastIndexOf('@')
  if (at < 1 || raw.includes(' ')) {
    return {
      raw,
      displayName: null,
      email: null,
      local: null,
      domain: null,
    }
  }
  return {
    raw,
    displayName: null,
    email: raw,
    local: raw.slice(0, at),
    domain: raw.slice(at + 1).toLowerCase(),
  }
}

export function formatFromAddress(
  local: string,
  domain: string,
  displayName?: string,
): string {
  const email = `${local.trim()}@${domain.trim()}`
  const name = displayName?.trim()
  if (!name) return email
  const safe = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${safe}" <${email}>`
}

/** Full From header for pre-domain test: `"FloatSend" <mail@floatsend.com>` */
export function platformSharedFromHeader(): string {
  const at = PLATFORM_SHARED_FROM.lastIndexOf('@')
  const local =
    at > 0 ? PLATFORM_SHARED_FROM.slice(0, at) : 'mail'
  const domain =
    at > 0 ? PLATFORM_SHARED_FROM.slice(at + 1) : 'floatsend.com'
  return formatFromAddress(local, domain, PLATFORM_SHARED_FROM_NAME)
}

export function extractEmailAddress(address: string): string | null {
  return parseMailbox(address).email
}

export function extractEmailDomain(address: string): string | null {
  return parseMailbox(address).domain
}

export function isPlatformSharedDomain(domain: string | null | undefined): boolean {
  if (!domain) return false
  return PLATFORM_SHARED_DOMAINS.includes(domain.toLowerCase())
}

/** Production: can_send customer domains only (exact). Platform domains for test mode. */
export function domainMatchesVerified(
  fromAddress: string,
  verifiedDomains: string[],
): boolean {
  const domain = extractEmailDomain(fromAddress)
  if (!domain) return false
  return verifiedDomains.some((d) => d.toLowerCase() === domain)
}

export function emailsEqual(a: string, b: string): boolean {
  const ea = extractEmailAddress(a)?.toLowerCase()
  const eb = extractEmailAddress(b)?.toLowerCase()
  if (!ea || !eb) {
    return a.trim().toLowerCase() === b.trim().toLowerCase()
  }
  return ea === eb
}

export function isValidMailbox(address: string): boolean {
  const { email } = parseMailbox(address)
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export interface PolicyCheck {
  ok: boolean
  mode: SendMode | 'reject'
  message?: string
}

export function checkSendPolicy(opts: {
  from: string
  to: string
  ownerEmail: string
  /** Domains with can_send === true */
  verifiedDomains: string[]
  mode: SendMode
}): PolicyCheck {
  const { from, to, ownerEmail, verifiedDomains, mode } = opts

  if (!isValidMailbox(from)) {
    return {
      ok: false,
      mode: 'reject',
      message:
        'Enter a valid From (e.g. user@domain.com or "Name" <user@domain.com>).',
    }
  }

  if (mode === 'platform_shared') {
    // Fixed platform From only — no free local-part (prevents impersonation)
    if (!emailsEqual(from, PLATFORM_SHARED_FROM)) {
      return {
        ok: false,
        mode: 'reject',
        message: `In test mode, the sender must be ${PLATFORM_SHARED_FROM}.`,
      }
    }
    if (!emailsEqual(to, ownerEmail)) {
      return {
        ok: false,
        mode: 'reject',
        message: 'In test mode, you can only send to your own email address.',
      }
    }
    return { ok: true, mode: 'platform_shared' }
  }

  // production — customer can_send domains only
  if (!domainMatchesVerified(from, verifiedDomains)) {
    return {
      ok: false,
      mode: 'reject',
      message:
        'The From address must use one of your verified domains that are ready to send.',
    }
  }
  const local = parseMailbox(from).local
  if (!local?.trim()) {
    return {
      ok: false,
      mode: 'reject',
      message: 'Enter a username before the @ in the From address.',
    }
  }
  return { ok: true, mode: 'production' }
}

export function isTerminalStatus(status: string): boolean {
  const s = status.toLowerCase()
  return (
    s === 'failed' ||
    s === 'bounced' ||
    s === 'complained' ||
    s === 'delivered' ||
    s === 'suppressed'
  )
}

export function isSuccessishStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'provider_accepted' || s === 'delivered'
}
