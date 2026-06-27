import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '@convex/_generated/api'
import { SearchPanel } from '../components/organisms/SearchPanel'
import { SiteHeader } from '../components/organisms/SiteHeader'
import { formatForumDate, previewForumContent } from '../lib/forum'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q.trim() : '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  const { data } = useSuspenseQuery(convexQuery(api.search.search, { q }))

  return (
    <main className="forum-shell">
      <SiteHeader
        subtitle={q ? `Search / ${q}` : 'Search'}
        navLabel="Search navigation"
        navItems={[{ href: '/', label: 'Home' }]}
      />

      <SearchPanel title="Search Again" query={q} />

      <section className="forum-panel search-results-panel" aria-labelledby="search-heading">
        <div className="panel-heading">
          <h1 id="search-heading">Search Results</h1>
          <span>{q ? `Matches for ${q}` : 'Enter a search term'}</span>
        </div>

        {!q ? <p className="thread-empty">Use the search box to find forums and threads.</p> : null}

        {q && data.forums.length === 0 && data.posts.length === 0 ? (
          <p className="thread-empty">No close matches found.</p>
        ) : null}

        {data.forums.length ? (
          <section className="search-group" aria-labelledby="search-forums-heading">
            <div className="panel-heading">
              <h2 id="search-forums-heading">Forums</h2>
              <span>{data.forums.length}</span>
            </div>
            <div className="search-list">
              {data.forums.map((forum) => (
                <article className="search-result-row" key={forum._id}>
                  <div>
                    <a className="thread-title" href={`/forums/${forum.slug}`}>
                      {forum.title}
                    </a>
                    <p>{forum.description}</p>
                  </div>
                  <small>{forum.postCount} posts</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.posts.length ? (
          <section className="search-group" aria-labelledby="search-threads-heading">
            <div className="panel-heading">
              <h2 id="search-threads-heading">Threads</h2>
              <span>{data.posts.length}</span>
            </div>
            <div className="search-list">
              {data.posts.map((post) => (
                <article className="search-result-row" key={post._id}>
                  <div>
                    <a className="thread-title" href={`/posts/${post._id}`}>
                      {post.title}
                    </a>
                    <p>{previewForumContent(post.content)}</p>
                    <small>
                      {post.forumTitle} / {formatForumDate(post.createdAt)}
                    </small>
                  </div>
                  <small>Thread</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}
