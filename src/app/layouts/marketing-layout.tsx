import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'

export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <SiteHeader />
      <main className="flex-1 animate-[fs-fade-in_300ms_ease-out]">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
