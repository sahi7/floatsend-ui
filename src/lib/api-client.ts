import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/token-storage'
import { getDeviceName } from '@/lib/utils'
import type { ApiErrorBody, TokenResult } from '@/types/api'
import { ApiError } from '@/lib/api-error'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''
const debugAuth = import.meta.env.VITE_DEBUG_AUTH === '1'

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FloatSendApp/1.0',
  },
  timeout: 30_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Device-Name'] = getDeviceName()
  if (debugAuth) {
    config.headers['X-Debug-Auth'] = '1'
  }
  // Fiber StrictRouting — prefer no trailing slash
  if (config.url && config.url.length > 1 && config.url.endsWith('/')) {
    config.url = config.url.replace(/\/+$/, '')
  }
  return config
})

/** Singleflight refresh — concurrent 401s share one refresh call */
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refresh_token = getRefreshToken()
    if (!refresh_token) {
      clearTokens()
      return null
    }
    try {
      const { data } = await axios.post<TokenResult>(
        `${baseURL}/v1/auth/refresh`,
        { refresh_token },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Name': getDeviceName(),
            ...(debugAuth ? { 'X-Debug-Auth': '1' } : {}),
          },
        },
      )
      setTokens(data.access_token, data.refresh_token)
      return data.access_token
    } catch {
      clearTokens()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const status = error.response?.status
    const body = error.response?.data

    // Do not refresh on auth endpoints themselves
    const url = original?.url || ''
    const isAuthPublic =
      url.includes('/v1/auth/login') ||
      url.includes('/v1/auth/signup') ||
      url.includes('/v1/auth/refresh') ||
      url.includes('/v1/auth/verify-email') ||
      url.includes('/v1/auth/password/forgot') ||
      url.includes('/v1/auth/password/reset') ||
      url.includes('/v1/auth/mfa/challenge') ||
      url.includes('/v1/auth/otp/request') ||
      url.includes('/v1/auth/otp/verify') ||
      url.includes('/v1/auth/google')

    if (
      status === 401 &&
      !original._retry &&
      !isAuthPublic &&
      body?.error !== 'mfa_required'
    ) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      // Session gone — let app handle redirect
      window.dispatchEvent(new CustomEvent('fs:session-expired'))
    }

    return Promise.reject(
      new ApiError(body ?? { message: error.message }, status),
    )
  },
)

/** Separate client for machine API-key calls (send email) — no JWT */
export function createApiKeyClient(rawKey: string) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${rawKey}`,
    },
    timeout: 30_000,
  })
  client.interceptors.response.use(
    (r) => r,
    (error: AxiosError<ApiErrorBody>) =>
      Promise.reject(
        new ApiError(
          error.response?.data ?? { message: error.message },
          error.response?.status,
        ),
      ),
  )
  return client
}

export { refreshAccessToken }
