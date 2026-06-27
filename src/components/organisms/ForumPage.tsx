import { useState } from 'react'

import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { forumSortOptions, sortForumThreads, type ForumSortMode } from '../../lib/forum'
import { SortSelect } from '../molecules/SortSelect'
import { SiteHeader } from './SiteHeader'
import { ForumThreads } from './ForumThreads'

type ForumPageProps = {
  forumId: Id<'forums'>
  forumSlug: string
  forumTitle: string
  forumDescription: string
  creatorUsername: string
  moderatorUsernames: string[]
}

export function ForumPage({
  forumId,
  forumSlug,
  forumTitle,
  forumDescription,
  creatorUsername,
  moderatorUsernames,
}: ForumPageProps) {
  const { data: forumPosts } = useSuspenseQuery(convexQuery(api.posts.list, { forumId }))
  const [sortMode, setSortMode] = useState<ForumSortMode>('newest')
  const sortedPosts = sortForumThreads(forumPosts, sortMode)

  return (
    <main className="forum-shell">
      <SiteHeader
        subtitle={`${forumTitle} / Active Threads`}
        navLabel="Forum navigation"
        navItems={[
          { href: '/', label: 'Index' },
          { href: `/forums/${forumSlug}`, label: 'Refresh board' },
        ]}
      />

      <section className="forum-panel thread-panel">
        <div className="panel-heading thread-heading">
          <div>
            <h1>{forumTitle}</h1>
            <span>{forumDescription}</span>
            <span>
              Owner: <span className="username">{creatorUsername}</span>
              {(moderatorUsernames ?? []).length > 0
                ? ` / Mods: ${(moderatorUsernames ?? []).join(', ')}`
                : ''}
            </span>
          </div>
          <SortSelect
            label="Sort threads"
            value={sortMode}
            options={forumSortOptions}
            onChange={setSortMode}
          />
        </div>

        <ForumThreads forumId={forumId} posts={sortedPosts} />
      </section>
    </main>
  )
}
