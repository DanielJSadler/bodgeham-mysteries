import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import { ForumPage as ForumPageView } from '../components/organisms/ForumPage'

export const Route = createFileRoute('/forums/$slug')({
  component: ForumRoutePage,
})

function ForumRoutePage() {
  const { slug } = Route.useParams()
  const { data: forum } = useSuspenseQuery(convexQuery(api.forums.getBySlug, { slug }))

  console.log(forum)

  if (!forum) {
    return (
      <main className="forum-shell">
        <section className="forum-panel thread-panel">
          <div className="panel-heading">
            <h1>Forum not found</h1>
          </div>
          <p className="thread-empty">That forum does not exist.</p>
        </section>
      </main>
    )
  }

  return (
    <ForumPageView
      forumId={forum._id}
      forumSlug={forum.slug}
      forumTitle={forum.title}
      forumDescription={forum.description}
      creatorUsername={forum.creatorUsername}
      moderatorUsernames={forum.moderatorUsernames}
    />
  )
}
