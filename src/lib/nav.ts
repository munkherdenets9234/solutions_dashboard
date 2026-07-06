export interface NavItem {
  href: string
  label: string
}

export interface NavSection {
  heading: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    heading: 'Manage',
    items: [
      { href: '/tours', label: 'Tours' },
      { href: '/bookings', label: 'Bookings' },
      { href: '/rentals', label: 'Rentals' },
      { href: '/airport-transfers', label: 'Airport Transfers' },
      { href: '/cars', label: 'Cars' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact-messages', label: 'Contact Messages' },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/staff', label: 'Staff' },
      { href: '/settings', label: 'Settings' },
    ],
  },
]

export function navLabelForPath(pathname: string): string {
  const all = NAV_SECTIONS.flatMap((s) => s.items)
  const exact = all.find((i) => i.href === pathname)
  if (exact) return exact.label
  const prefixMatch = all
    .filter((i) => i.href !== '/' && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return prefixMatch?.label ?? 'Dashboard'
}
