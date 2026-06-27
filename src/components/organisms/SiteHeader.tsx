import type { ReactNode } from 'react'

import { VisitCounter } from './VisitCounter'

type SiteNavItem = {
  href: string
  label: string
}

type SiteHeaderProps = {
  subtitle: ReactNode
  navLabel: string
  navItems: SiteNavItem[]
}

export function SiteHeader({ subtitle, navLabel, navItems }: SiteHeaderProps) {
  return (
    <>
      <header className="site-header">
        <div className="space-badger" aria-hidden="true">
          <img src="/badger.png" alt="badger image" />
        </div>

        <img
          className="title-gif"
          src="https://images.cooltext.com/5753289.gif"
          alt="Bodgeham Mysteries"
        />
        <p className="site-subtitle">{subtitle}</p>
        <VisitCounter />
      </header>

      <nav className="forum-nav" aria-label={navLabel}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </>
  )
}
