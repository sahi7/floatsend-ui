import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { authService } from '@/services/auth'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasSession,
  setTokens,
} from '@/lib/token-storage'
import { refreshAccessToken } from '@/lib/api-client'
import { toApiError } from '@/lib/api-error'
import type { TokenResult, UserMe } from '@/types/api'

interface AuthContextValue {
  user: UserMe | null
  isLoading: boolean
  isAuthenticated: boolean
  mfaToken: string | null
  setMfaToken: (token: string | null) => void
  applyTokenResult: (result: TokenResult) => Promise<void>
  refreshUser: () => Promise<UserMe | null>
  logout: () => Promise<void>
  boot: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mfaToken, setMfaToken] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.me()
      setUser(data)
      return data
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.status === 401) {
        setUser(null)
      }
      return null
    }
  }, [])

  const applyTokenResult = useCallback(
    async (result: TokenResult) => {
      setTokens(result.access_token, result.refresh_token)
      setMfaToken(null)
      await refreshUser()
    },
    [refreshUser],
  )

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) {
        await authService.logout()
      }
    } catch {
      /* ignore */
    } finally {
      clearTokens()
      setUser(null)
      setMfaToken(null)
    }
  }, [])

  const boot = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!hasSession()) {
        setUser(null)
        return
      }
      if (!getAccessToken() && getRefreshToken()) {
        const token = await refreshAccessToken()
        if (!token) {
          setUser(null)
          return
        }
      }
      await refreshUser()
    } finally {
      setIsLoading(false)
    }
  }, [refreshUser])

  useEffect(() => {
    void boot()
  }, [boot])

  useEffect(() => {
    function onExpired() {
      clearTokens()
      setUser(null)
    }
    window.addEventListener('fs:session-expired', onExpired)
    return () => window.removeEventListener('fs:session-expired', onExpired)
  }, [])

  useEffect(() => {
    function onOffline() {
      toast.error("You're offline")
    }
    window.addEventListener('offline', onOffline)
    return () => window.removeEventListener('offline', onOffline)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      mfaToken,
      setMfaToken,
      applyTokenResult,
      refreshUser,
      logout,
      boot,
    }),
    [
      user,
      isLoading,
      mfaToken,
      applyTokenResult,
      refreshUser,
      logout,
      boot,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
