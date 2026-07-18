const REFRESH_KEY = 'fs_refresh_token'
const ACCESS_KEY = 'fs_access_token'

/** In-memory access token (preferred short-lived store) */
let accessTokenMemory: string | null = null

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory
  try {
    const fromSession = sessionStorage.getItem(ACCESS_KEY)
    if (fromSession) {
      accessTokenMemory = fromSession
      return fromSession
    }
  } catch {
    /* private mode */
  }
  return null
}

export function setAccessToken(token: string | null) {
  accessTokenMemory = token
  try {
    if (token) sessionStorage.setItem(ACCESS_KEY, token)
    else sessionStorage.removeItem(ACCESS_KEY)
  } catch {
    /* private mode */
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token)
    else localStorage.removeItem(REFRESH_KEY)
  } catch {
    /* private mode */
  }
}

export function setTokens(access: string, refresh: string) {
  setAccessToken(access)
  setRefreshToken(refresh)
}

export function clearTokens() {
  setAccessToken(null)
  setRefreshToken(null)
}

export function hasSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken())
}
