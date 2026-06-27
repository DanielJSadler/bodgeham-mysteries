import * as React from 'react'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import appCss from '~/styles/app.css?url'
import { ActivityHeartbeat } from '../components/organisms/ActivityHeartbeat'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Bodgeham Mysteries' },
      {
        name: 'description',
        content: 'A retro forum for the unsolved mysteries of Bodgeham.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ActivityHeartbeat />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
