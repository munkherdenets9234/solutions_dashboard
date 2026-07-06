'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS } from '@/lib/nav'
import { logoutAction } from '@/lib/auth/actions'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <div className="w-[240px] shrink-0 border-r border-hairline bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-hairline">
        <div className="w-7 h-7 rounded-[7px] bg-ink shrink-0" />
        <div className="min-w-0">
          <div className="font-wordmark font-bold text-[19px] leading-none">Travel Mongolia</div>
          <div className="text-[10px] font-medium text-muted tracking-widest uppercase mt-0.5">Admin</div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto px-3 py-3.5 flex flex-col gap-[18px]">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="text-[10px] font-semibold text-muted tracking-wider uppercase px-2 pb-1.5">
              {section.heading}
            </div>
            <div className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] font-medium ${
                      active ? 'bg-ink text-ink-contrast' : 'text-body hover:bg-hairline-soft'
                    }`}
                  >
                    <span
                      className={`w-[15px] h-[15px] rounded shrink-0 ${
                        active ? 'bg-ink-contrast' : 'border-[1.5px] border-input-border'
                      }`}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-[30px] h-[30px] rounded-full bg-input-border shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold truncate">{email}</div>
            <div className="text-[11px] text-muted">Signed in</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-[12px] font-semibold text-body border border-hairline rounded-md py-1.5 hover:bg-hairline-soft"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}
