import { api, createApiKeyClient } from '@/lib/api-client'
import type {
  EmailLogEntry,
  EmailLogsListParams,
  EmailLogsMeta,
  EmailLogsResponse,
  EmailStatusResponse,
  EmailTimelineEvent,
  SendEmailRequest,
  SendEmailResponse,
} from '@/types/api'

function normalizeLogsResponse(
  data: EmailLogsResponse | EmailLogEntry[],
): EmailLogsResponse {
  if (Array.isArray(data)) {
    return { logs: data }
  }
  return {
    ...data,
    logs: data.logs ?? data.emails ?? data.items ?? [],
  }
}

export const emailsService = {
  /** Machine API key — never JWT */
  send(rawKey: string, body: SendEmailRequest, idempotencyKey?: string) {
    const client = createApiKeyClient(rawKey)
    return client.post<SendEmailResponse>('/v1/emails/send', body, {
      headers: idempotencyKey
        ? { 'Idempotency-Key': idempotencyKey }
        : undefined,
    })
  },

  /** Machine API key status poll */
  getStatus(rawKey: string, messageId: string) {
    const client = createApiKeyClient(rawKey)
    return client.get<EmailStatusResponse>(`/v1/emails/${messageId}`)
  },

  /** Filter metadata for Activity UI dropdowns */
  logsMeta() {
    return api.get<EmailLogsMeta>('/v1/emails/logs/meta')
  },

  /** JWT control-plane logs (V4 filters + fields projection) */
  listLogs(params?: EmailLogsListParams) {
    return api
      .get<EmailLogsResponse | EmailLogEntry[]>('/v1/emails/logs', { params })
      .then((r) => ({ ...r, data: normalizeLogsResponse(r.data) }))
  },

  /** Dashboard last-5 widget */
  dashboardPreview(range = '7d') {
    return this.listLogs({ preview: 1, range })
  },

  getLog(id: string) {
    return api.get<EmailLogEntry>(`/v1/emails/logs/${id}`)
  },

  getTimeline(id: string) {
    return api
      .get<EmailTimelineEvent[] | { events: EmailTimelineEvent[] }>(
        `/v1/emails/logs/${id}/timeline`,
      )
      .then((r) => {
        const data = r.data
        const events = Array.isArray(data) ? data : (data.events ?? [])
        return { ...r, data: events }
      })
  },
}

export function logRecipient(log: EmailLogEntry): string {
  if (log.recipient) return String(log.recipient)
  if (Array.isArray(log.to)) return log.to[0] || '—'
  if (log.to) return String(log.to)
  return '—'
}

export function logFrom(log: EmailLogEntry): string {
  return String(log.from_address || log.from || '—')
}
