import { api } from '@/lib/api-client'
import type {
  CreateWebhookRequest,
  CreateWebhookResponse,
  OkResponse,
  WebhookDeadLetter,
  WebhookDeadLettersResponse,
  WebhookDeliveriesResponse,
  WebhookDelivery,
  WebhookEndpoint,
  WebhookEventType,
  WebhookEventsResponse,
  WebhookOrderingResponse,
} from '@/types/api'

function normalizeEvents(
  data: WebhookEventsResponse | WebhookEventType[] | string[],
): WebhookEventType[] {
  if (Array.isArray(data)) {
    return data.map((e) =>
      typeof e === 'string' ? { name: e } : e,
    )
  }
  const raw = data.events ?? data.event_types ?? []
  return (raw as (WebhookEventType | string)[]).map((e) =>
    typeof e === 'string' ? { name: e } : e,
  )
}

function normalizeEndpoints(
  data: WebhookEndpoint[] | { endpoints: WebhookEndpoint[] },
): WebhookEndpoint[] {
  if (Array.isArray(data)) return data
  return data.endpoints ?? []
}

function normalizeDeliveries(
  data: WebhookDeliveriesResponse | WebhookDelivery[],
): WebhookDelivery[] {
  if (Array.isArray(data)) return data
  return data.deliveries ?? data.items ?? []
}

function normalizeDeadLetters(
  data: WebhookDeadLettersResponse | WebhookDeadLetter[],
): WebhookDeadLetter[] {
  if (Array.isArray(data)) return data
  return data.dead_letters ?? data.items ?? []
}

export const webhooksService = {
  listEvents() {
    return api
      .get<WebhookEventsResponse | WebhookEventType[] | string[]>(
        '/v1/webhooks/events',
      )
      .then((r) => ({ ...r, data: normalizeEvents(r.data) }))
  },

  listEndpoints() {
    return api
      .get<WebhookEndpoint[] | { endpoints: WebhookEndpoint[] }>(
        '/v1/webhooks/endpoints',
      )
      .then((r) => ({ ...r, data: normalizeEndpoints(r.data) }))
  },

  getEndpoint(id: string) {
    return api.get<WebhookEndpoint>(`/v1/webhooks/endpoints/${id}`)
  },

  createEndpoint(body: CreateWebhookRequest) {
    return api.post<CreateWebhookResponse>('/v1/webhooks/endpoints', body)
  },

  updateEndpoint(
    id: string,
    body: Partial<CreateWebhookRequest> & { is_active?: boolean },
  ) {
    return api.patch<WebhookEndpoint>(`/v1/webhooks/endpoints/${id}`, body)
  },

  deleteEndpoint(id: string) {
    return api.delete<OkResponse>(`/v1/webhooks/endpoints/${id}`)
  },

  rotateSecret(id: string) {
    return api.post<{ secret: string; message?: string }>(
      `/v1/webhooks/endpoints/${id}/rotate-secret`,
    )
  },

  listDeliveries(params?: { endpoint_id?: string; limit?: number }) {
    return api
      .get<WebhookDeliveriesResponse | WebhookDelivery[]>(
        '/v1/webhooks/deliveries',
        { params },
      )
      .then((r) => ({ ...r, data: normalizeDeliveries(r.data) }))
  },

  getDelivery(id: string) {
    return api.get<WebhookDelivery>(`/v1/webhooks/deliveries/${id}`)
  },

  listDeadLetters() {
    return api
      .get<WebhookDeadLettersResponse | WebhookDeadLetter[]>(
        '/v1/webhooks/dead-letters',
      )
      .then((r) => ({ ...r, data: normalizeDeadLetters(r.data) }))
  },

  getOrdering() {
    return api.get<WebhookOrderingResponse>('/v1/webhooks/ordering')
  },
}
