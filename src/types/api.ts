/** Global API error shape from FloatSend backend */
export interface ApiErrorBody {
  code?: number
  error?: string
  message?: string
  trace_id?: string
  retry_after?: number
  mfa_required?: boolean
  mfa_token?: string
  user_id?: string
  details?: Record<string, string[] | string>
}

export interface TokenResult {
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: string
  email_verified: boolean
  user_id: string
  org_id: string
  role: OrgRole
  session_id: string
  message?: string
  debug_verify_token?: string
}

export type OrgRole = 'owner' | 'admin' | 'member'

export interface UserMe {
  id: string
  email: string
  name: string
  status: string
  email_verified: boolean
  mfa_enabled: boolean
  org_id: string
  role: OrgRole
  session_id: string
  home_org_id: string
  created_at: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  org_name?: string
}

export interface LoginRequest {
  email: string
  password: string
  mfa_code?: string
  recovery_code?: string
  mfa_token?: string
}

export interface MfaChallengeRequest {
  mfa_token: string
  mfa_code?: string
  recovery_code?: string
}

export interface OkResponse {
  ok: boolean
  message?: string
  status?: string
}

export interface SessionView {
  id: string
  device_name?: string
  user_agent?: string
  ip?: string
  created_at: string
  last_used_at?: string
  current?: boolean
}

export interface MfaEnrollResponse {
  secret: string
  otpauth_url: string
}

export interface MfaConfirmResponse {
  ok?: boolean
  recovery_codes: string[]
}

export interface AuthOrganization {
  organization_id: string
  role: OrgRole
  status: string
  current?: boolean
  name?: string
}

export interface AuthOrganizationsResponse {
  organizations: AuthOrganization[]
  current_org_id: string
}

export interface Organization {
  id: string
  name: string
  slug?: string
  status?: string
  created_at?: string
}

export interface MemberView {
  user_id: string
  email?: string
  name?: string
  role: OrgRole
  status?: string
  joined_at?: string
}

export interface InvitationView {
  id: string
  email: string
  role: OrgRole
  status?: string
  created_at?: string
  expires_at?: string
  debug_token?: string
}

export type DomainStatus =
  | 'ownership_pending'
  | 'pending'
  | 'dns_pending'
  | 'verified'
  | 'suspended'
  | 'expired'
  | 'revoked'
  | 'deleted'

export interface DnsRecord {
  domain?: string
  host?: string
  /** SES Easy DKIM often uses `name` instead of `host` */
  name?: string
  type?: string
  value?: string
  instruction?: string
  recommended_record?: string
  include?: string
}

export type SesStatus =
  | 'none'
  | 'pending_create'
  | 'pending_dns'
  | 'verified'
  | 'failed'
  | 'capacity_blocked'
  | string

export interface DomainView {
  id: string
  organization_id: string
  domain: string
  status: DomainStatus
  ownership_verified?: boolean
  ownership_token?: string
  verification_token?: string
  ownership_token_expires_at?: string
  ownership_record?: DnsRecord
  spf_record?: DnsRecord
  dkim_record?: DnsRecord
  dmarc_record?: DnsRecord
  spf_verified?: boolean
  dkim_verified?: boolean
  dmarc_detected?: boolean
  last_error?: string
  last_verification_error?: string
  /** SES identity lifecycle (V3) */
  ses_status?: SesStatus
  ses_region?: string
  ses_dns_records?: DnsRecord[]
  /** True only when FloatSend + SES ready for production From */
  can_send?: boolean
  return_path_domain?: string
  tracking_enabled?: boolean
  default_from_name?: string
  default_reply_to?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

export interface DomainsListResponse {
  organization_id: string
  domains: DomainView[]
}

export interface DomainCheckStatus {
  status: 'verified' | 'pending' | 'failed' | string
  detail?: string
}

export interface VerifyOwnershipResponse {
  domain: DomainView
  checks: {
    domain?: string
    ownership?: DomainCheckStatus
  }
  created?: boolean
}

export interface VerifyDnsResponse {
  domain: DomainView
  checks: {
    spf?: DomainCheckStatus
    dkim?: DomainCheckStatus
    dmarc?: DomainCheckStatus
  }
}

export interface VerifySesResponse {
  domain: DomainView
  can_send?: boolean
  message?: string
}

export interface DomainSettingsPatch {
  return_path_domain?: string
  tracking_enabled?: boolean
  default_from_name?: string
  default_reply_to?: string
  is_default?: boolean
}

export type ApiKeyType = 'live' | 'test'
export type ApiKeyStatus = 'active' | 'revoked' | 'expired'

export type ApiKeyScope =
  | 'email:send'
  | 'email:domains:read'
  | 'email:domains:write'
  | 'api_keys:read'
  | 'api_keys:write'
  | 'organization:read'
  | 'webhooks:read'
  | 'webhooks:write'

export interface ApiKeyView {
  id: string
  org_id: string
  name: string
  key_prefix: string
  type: ApiKeyType
  status: ApiKeyStatus | string
  is_active: boolean
  scopes: string[]
  scope_version?: number
  rate_limit_rps?: number
  created_at: string
  last_used_at?: string | null
}

export interface ApiKeysListResponse {
  organization_id: string
  api_keys: ApiKeyView[]
}

export interface CreateApiKeyRequest {
  name: string
  type: ApiKeyType
  scopes: string[]
}

export interface CreateApiKeyResponse {
  key: ApiKeyView
  raw_key: string
  message?: string
}

export interface RotateApiKeyResponse {
  key: ApiKeyView
  raw_key: string
  message?: string
}

export interface SendEmailRequest {
  from: string
  to: string[]
  subject: string
  text_body?: string
  html_body?: string
  headers?: Record<string, string>
  idempotency_key?: string
}

export interface SendEmailResponse {
  message_id: string
  status: string
  is_test: boolean
}

export type EmailDeliveryStatus =
  | 'accepted'
  | 'queued'
  | 'processing'
  | 'provider_accepted'
  | 'failed'
  | 'bounced'
  | 'complained'
  | 'delivered'
  | 'suppressed'
  | string

export interface EmailStatusResponse {
  message_id: string
  status: EmailDeliveryStatus
  last_error?: string
  attempt_count?: number
  provider_message_id?: string
  updated_at?: string
  from?: string
  to?: string[] | string
  subject?: string
  created_at?: string
}

/** Log rows may be field-projected maps (V4) */
export interface EmailLogEntry {
  id?: string
  message_id?: string
  status?: EmailDeliveryStatus
  last_error?: string
  from?: string
  from_address?: string
  to?: string | string[]
  recipient?: string
  subject?: string
  created_at?: string
  updated_at?: string
  sent_at?: string
  attempt_count?: number
  provider_message_id?: string
  provider_name?: string
  api_key_id?: string
  [key: string]: unknown
}

export interface EmailLogsResponse {
  logs?: EmailLogEntry[]
  emails?: EmailLogEntry[]
  items?: EmailLogEntry[]
  total?: number
  next_cursor?: string | null
  visible_from?: string
  retention_days?: number
  fields?: string[]
}

export interface EmailLogsMeta {
  statuses: string[]
  time_ranges: string[]
  allowed_fields: string[]
  default_fields: string[]
  dashboard_preview_fields: string[]
  max_limit: number
  search_max_len: number
}

export interface EmailLogsListParams {
  range?: string
  since?: string
  until?: string
  status?: string
  statuses?: string
  api_key_id?: string
  from?: string
  recipient?: string
  q?: string
  message_id?: string
  provider_message_id?: string
  fields?: string
  preview?: 1 | boolean
  limit?: number
  cursor?: string
}

export interface EmailTimelineEvent {
  id?: string
  event_type?: string
  status?: string
  timestamp?: string
  created_at?: string
  detail?: string
  metadata?: Record<string, unknown>
}

export interface GoogleAuthUrlResponse {
  url: string
}

/* ── Webhooks ── */

export interface WebhookEventType {
  name: string
  description?: string
  requires_sns?: boolean
}

export interface WebhookEventsResponse {
  events?: WebhookEventType[] | string[]
  event_types?: WebhookEventType[] | string[]
}

export interface WebhookEndpoint {
  id: string
  url: string
  subscribed_events: string[]
  include_subject?: boolean
  description?: string
  is_active?: boolean
  payload_version?: number
  circuit_state?: string
  created_at?: string
  updated_at?: string
}

export interface CreateWebhookRequest {
  url: string
  subscribed_events: string[]
  include_subject?: boolean
  description?: string
}

export interface CreateWebhookResponse {
  endpoint: WebhookEndpoint
  secret: string
  message?: string
  ordering?: string
}

export interface WebhookDelivery {
  id: string
  endpoint_id?: string
  event_id?: string
  event_type?: string
  status?: string
  attempt?: number
  http_status?: number
  response_body?: string
  error?: string
  created_at?: string
  delivered_at?: string
}

export interface WebhookDeliveriesResponse {
  deliveries?: WebhookDelivery[]
  items?: WebhookDelivery[]
}

export interface WebhookDeadLetter {
  id: string
  endpoint_id?: string
  event_type?: string
  error?: string
  created_at?: string
  last_attempt_at?: string
}

export interface WebhookDeadLettersResponse {
  dead_letters?: WebhookDeadLetter[]
  items?: WebhookDeadLetter[]
}

export interface WebhookOrderingResponse {
  ordering?: string
  description?: string
}
