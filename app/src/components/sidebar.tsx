'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, CreditCard,
  Wrench, Settings, LogOut, MessageSquareMore
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { RentoraLogo } from './rentora-logo'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/properties', label: 'Properties', icon: Building2 },
  { href: '/dashboard/tenants', label: 'Tenants', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/dashboard/ai-inbox', label: 'AI Inbox', icon: MessageSquareMore },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-black/8 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-black/8">
        <RentoraLogo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-[#0A1628] text-white'
                  : 'text-[#6B7280] hover:bg-[#F5F2EA] hover:text-[#0A1628]'
              )}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-black/8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
