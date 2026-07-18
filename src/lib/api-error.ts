import type { AxiosError } from 'axios'
import type { ApiErrorBody } from '@/types/api'

export class ApiError extends Error {
  code?: number
  error?: string
  message: string
  trace_id?: string
  retry_after?: number
  mfa_required?: boolean
  mfa_token?: string
  user_id?: string
  details?: Record<string, string[] | string>
  status?: number

  constructor(body: ApiErrorBody = {}, status?: number) {
    super(body.message || body.error || 'Something went wrong')
    this.name = 'ApiError'
    this.code = body.code ?? status
    this.error = body.error
    this.message = body.message || body.error || 'Something went wrong'
    this.trace_id = body.trace_id
    this.retry_after = body.retry_after
    this.mfa_required = body.mfa_required
    this.mfa_token = body.mfa_token
    this.user_id = body.user_id
    this.details = body.details
    this.status = status
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  const axiosErr = err as AxiosError<ApiErrorBody>
  if (axiosErr?.isAxiosError) {
    const body = axiosErr.response?.data ?? {}
    return new ApiError(body, axiosErr.response?.status)
  }
  if (err instanceof Error) return new ApiError({ message: err.message })
  return new ApiError({ message: 'Unexpected error' })
}

export function getFieldErrors(err: ApiError): Record<string, string> {
  if (!err.details) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(err.details)) {
    out[key] = Array.isArray(value) ? value[0] : value
  }
  return out
}

export function userFacingAuthMessage(err: ApiError): string {
  switch (err.error) {
    case 'invalid_credentials':
      return 'Email or password incorrect'
    case 'email_not_verified':
      return 'Please verify your email to continue'
    case 'mfa_invalid':
      return 'Invalid authentication code'
    case 'mfa_required':
      return 'Multi-factor authentication required'
    case 'session_revoked':
    case 'invalid_token':
      return 'Your session has expired. Please sign in again.'
    case 'forbidden':
      return 'You do not have permission for this action'
    case 'rate_limit_exceeded':
      return err.retry_after
        ? `Too many requests. Try again in ${err.retry_after}s.`
        : 'Too many requests. Please try again shortly.'
    case 'domain_already_owned':
    case 'conflict':
      return err.message || 'This resource already exists'
    case 'validation_failed':
    case 'invalid_payload':
      return err.message || 'Please check the form and try again'
    case 'domain_not_verified':
      return (
        err.message ||
        'This From domain is not ready to send yet. Finish domain setup, or send a test to your own email.'
      )
    case 'test_recipient_not_allowed':
      return 'In test mode, you can only send to your own email address'
    case 'quota_exceeded':
      return err.message || 'You have reached your send limit for this plan'
    default:
      return err.message || 'Something went wrong'
  }
}
