import { useState } from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import {
  KeyRound,
  Globe,
  Home,
  Inbox,
  LogOut,
  Menu,
  Moon,
  CreditCard,
  MessageSquare,
  Send,
  Settings,
  Sun,
  Users,
  Webhook,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { toast } from 'sonner'
import { toApiError, userFacingAuthMessage } from '@/lib/api-error'

const navItems = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/send', label: 'Send', icon: Send },
  { to: '/inbox', label: 'Inbox', icon: MessageSquare },
  { to: '/activity', label: 'Activity', icon: Inbox },
  { to: '/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings/team', label: 'Team', icon: Users },
  { to: '/settings/security', label: 'Settings', icon: Settings },
]

const mobileNav = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/inbox', label: 'Inbox', icon: MessageSquare },
  { to: '/send', label: 'Send', icon: Send },
  { to: '/activity', label: 'Activity', icon: Inbox },
  { to: '/settings/security', label: 'More', icon: Menu },
]

export function AppShell() {
  const { user, isLoading, isAuthenticated, logout, applyTokenResult } =
    useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const orgsQuery = useQuery({
    queryKey: ['auth-organizations'],
    queryFn: async () => {
      const { data } = await authService.listOrganizations()
      return data
    },
    enabled: isAuthenticated,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)]">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-32" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  async function handleSwitchOrg(organizationId: string) {
    try {
      const { data } = await authService.switchOrganization(organizationId)
      await applyTokenResult(data)
      await queryClient.invalidateQueries()
      toast.success('Workspace switched')
    } catch (err) {
      toast.error(userFacingAuthMessage(toApiError(err)))
    }
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium cursor-pointer',
      'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
      isActive
        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
        : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
    )

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)] min-[960px]:flex">
        <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
          <Logo />
        </div>

        <div className="border-b border-[var(--border)] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--muted-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <Building2 className="size-4 shrink-0 text-[var(--muted)]" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  Workspace
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-[var(--muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(orgsQuery.data?.organizations ?? []).map((org) => (
                <DropdownMenuItem
                  key={org.organization_id}
                  onClick={() => handleSwitchOrg(org.organization_id)}
                  className={cn(
                    org.current || org.organization_id === user.org_id
                      ? 'text-[var(--accent)]'
                      : '',
                  )}
                >
                  <span className="truncate">
                    {org.name || org.organization_id.slice(0, 12)}
                  </span>
                  <span className="ml-auto text-xs text-[var(--muted)]">
                    {org.role}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3 space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
          <div className="px-3 pt-2 text-xs text-[var(--muted-2)] truncate">
            {user.email}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 min-[960px]:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 min-[960px]:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-[var(--border)] bg-[var(--surface)] p-4"
            aria-label="Mobile menu"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="min-[960px]:pl-60">
        <div className="mx-auto w-full max-w-[960px] px-4 py-6 pb-24 min-[960px]:px-8 min-[960px]:py-8 min-[960px]:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--border)] bg-[var(--surface)] min-[960px]:hidden"
        aria-label="Bottom navigation"
      >
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]',
              )
            }
          >
            <item.icon className="size-5" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
