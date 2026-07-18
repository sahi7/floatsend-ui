import { api } from '@/lib/api-client'
import type {
  GoogleAuthUrlResponse,
  LoginRequest,
  MfaChallengeRequest,
  MfaConfirmResponse,
  MfaEnrollResponse,
  OkResponse,
  SessionView,
  SignupRequest,
  TokenResult,
  UserMe,
  AuthOrganizationsResponse,
} from '@/types/api'

export const authService = {
  signup(body: SignupRequest) {
    return api.post<TokenResult>('/v1/auth/signup', body)
  },

  login(body: LoginRequest) {
    return api.post<TokenResult>('/v1/auth/login', body)
  },

  logout() {
    return api.post<OkResponse>('/v1/auth/logout')
  },

  me() {
    return api.get<UserMe>('/v1/auth/me')
  },

  verifyEmail(token: string) {
    return api.post<OkResponse>('/v1/auth/verify-email', { token })
  },

  /** JWT required — resend verification email (in-house mail) */
  resendVerifyEmail() {
    return api.post<OkResponse>('/v1/auth/verify-email/resend')
  },

  /** Passwordless OTP — always generic 200 */
  requestOtp(email: string) {
    return api.post<OkResponse>('/v1/auth/otp/request', { email })
  },

  verifyOtp(email: string, code: string) {
    return api.post<TokenResult>('/v1/auth/otp/verify', { email, code })
  },

  forgotPassword(email: string) {
    return api.post<OkResponse>('/v1/auth/password/forgot', { email })
  },

  resetPassword(token: string, new_password: string) {
    return api.post<OkResponse>('/v1/auth/password/reset', {
      token,
      new_password,
    })
  },

  changePassword(current_password: string, new_password: string) {
    return api.post<OkResponse>('/v1/auth/password/change', {
      current_password,
      new_password,
    })
  },

  mfaChallenge(body: MfaChallengeRequest) {
    return api.post<TokenResult>('/v1/auth/mfa/challenge', body)
  },

  mfaEnroll() {
    return api.post<MfaEnrollResponse>('/v1/auth/mfa/enroll')
  },

  mfaConfirm(code: string) {
    return api.post<MfaConfirmResponse>('/v1/auth/mfa/confirm', { code })
  },

  mfaDisable(payload: { code?: string; recovery_code?: string }) {
    return api.post<OkResponse>('/v1/auth/mfa/disable', payload)
  },

  listSessions() {
    return api.get<SessionView[] | { sessions: SessionView[] }>(
      '/v1/auth/sessions',
    )
  },

  revokeSession(id: string) {
    return api.delete<OkResponse>(`/v1/auth/sessions/${id}`)
  },

  revokeAllSessions() {
    return api.delete<OkResponse>('/v1/auth/sessions')
  },

  listOrganizations() {
    return api.get<AuthOrganizationsResponse>('/v1/auth/organizations')
  },

  switchOrganization(organization_id: string) {
    return api.post<TokenResult>('/v1/auth/switch-organization', {
      organization_id,
    })
  },

  googleUrl() {
    return api.get<GoogleAuthUrlResponse>('/v1/auth/google')
  },
}
