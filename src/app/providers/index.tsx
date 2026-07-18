import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/app/providers/auth-provider'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            mobileOffset={{ top: 16 }}
            duration={4000}
            theme="system"
            toastOptions={{
              classNames: {
                toast:
                  'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-none',
                description: 'text-[var(--muted)]',
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
