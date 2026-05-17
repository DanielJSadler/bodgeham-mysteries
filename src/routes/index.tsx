import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import { AuthPanel } from '../components/organisms/AuthPanel'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: forums } = useSuspenseQuery(convexQuery(api.forums.list, {}))
  const { data: recentPosts } = useSuspenseQuery(convexQuery(api.posts.recent, {}))

  return (
    <main className="forum-shell">
      <header className="site-header">
        <div className="space-badge" aria-hidden="true">
          BM
        </div>
        <img
          className="title-gif"
          src="https://images.cooltext.com/5753289.gif"
          alt="Bodgeham Mysteries"
        />
        <p className="site-subtitle">The Board for Unsolved Village Phenomena</p>
      </header>

      <nav className="forum-nav" aria-label="Primary navigation">
        <a href="/">Home</a>
        <a href="/">Forum Index</a>
        <a href="/">Members</a>
        <a href="/">Archive</a>
      </nav>

      <div className="forum-layout">
        <section className="forum-panel main-board" aria-labelledby="forum-heading">
          <div className="panel-heading">
            <h1 id="forum-heading">Forum</h1>
            <span>Posts</span>
          </div>

          <div className="forum-list">
            {forums.map((forum) => (
              <article className="forum-row" key={forum._id}>
                <div className={`forum-icon forum-icon-${forum.icon}`} aria-hidden="true" />
                <div className="forum-copy">
                  <a className="forum-title" href={`/forums/${forum.slug}`}>
                    {forum.title}
                  </a>
                  <p>{forum.description}</p>
                  {forum.lastPost ? (
                    <small>
                      Last signal: {forum.lastPost.title} by{' '}
                      <span className="username">{forum.lastPost.authorUsername}</span>
                    </small>
                  ) : (
                    <small>No signals logged yet.</small>
                  )}
                </div>
                <div className="forum-count">{forum.postCount.toLocaleString()}</div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-stack" aria-label="Forum sidebar">
          <AuthPanel />

          <section className="forum-panel compact-panel">
            <div className="panel-heading">
              <h2>Looking for Answers?</h2>
            </div>
            <form className="search-box">
              <input aria-label="Search forum" type="search" />
              <button type="button">Search</button>
            </form>
            <p className="pager">&lt;&lt; - 1 . -- &gt;&gt;</p>
          </section>

          <section className="forum-panel compact-panel">
            <div className="panel-heading">
              <h2>Who is Online</h2>
            </div>
            <p>237 Users</p>
            <p>11 Members</p>
            <p>2 Admins</p>
          </section>
        </aside>
      </div>

      <section className="forum-panel recent-panel" aria-labelledby="recent-heading">
        <div className="panel-heading">
          <h2 id="recent-heading">Recent Threads</h2>
          <span>Votes</span>
        </div>
        <div className="recent-list">
          {recentPosts.map((post) => (
            <article className="recent-row" key={post._id}>
              <div>
                <a href={`/posts/${post._id}`}>{post.title}</a>
                <p>
                  {post.forumTitle} / <span className="username">{post.authorUsername}</span> /{' '}
                  {formatDate(post.createdAt)}
                </p>
              </div>
              <span>{post.upvotes - post.downvotes}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        Powered by Bodgeham Community Archives. Best viewed at 800x600.
      </footer>
    </main>
  )
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}
