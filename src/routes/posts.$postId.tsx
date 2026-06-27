import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
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
      <header className="site-header forum-header">
        <div className="space-badge" aria-hidden="true">
          BM
        </div>
        <img
          className="title-gif"
          src="https://images.cooltext.com/5753289.gif"
          alt="Bodgeham Mysteries"
        />
        <p className="site-subtitle">Thread / {post.forumTitle}</p>
      </header>

      <nav className="forum-nav" aria-label="Thread navigation">
        <a href="/">Index</a>
        <a href={`/forums/${post.forumSlug}`}>Back to forum</a>
      </nav>

      <ThreadView post={post} />
    </main>
  )
}
