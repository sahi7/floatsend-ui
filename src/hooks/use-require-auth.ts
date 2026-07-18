import { useAuth } from '@/app/providers/auth-provider'

export function useRequireAuth() {
  return useAuth()
}
