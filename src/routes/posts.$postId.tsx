import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { SiteHeader } from '../components/organisms/SiteHeader'
import { ThreadView } from '../components/organisms/ThreadView'

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  const { data: post } = useSuspenseQuery(
    convexQuery(api.posts.get, { postId: postId as Id<'posts'> }),
  )

  if (!post) {
    return (
      <main className="forum-shell">
        <SiteHeader
          subtitle="Thread not found"
          navLabel="Thread navigation"
          navItems={[{ href: '/', label: 'Index' }]}
        />
        <section className="forum-panel thread-panel">
          <div className="panel-heading">
            <h1>Thread not found</h1>
          </div>
          <p className="thread-empty">That post does not exist.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="forum-shell">
      <SiteHeader
        subtitle={`Thread / ${post.forumTitle}`}
        navLabel="Thread navigation"
        navItems={[
          { href: '/', label: 'Index' },
          { href: `/forums/${post.forumSlug}`, label: 'Back to forum' },
        ]}
      />

      <ThreadView post={post} />
    </main>
  )
}
