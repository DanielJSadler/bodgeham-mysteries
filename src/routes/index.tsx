import { useEffect, useState } from 'react'

import { convexQuery } from '@convex-dev/react-query'
import { useConvexAuth } from '@convex-dev/auth/react'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import { Pagination } from '../components/atoms/Pagination'
import { AuthPanel } from '../components/organisms/AuthPanel'
import { SiteHeader } from '../components/organisms/SiteHeader'
import { errorMessage } from '../lib/forum'
import { uploadImageFile } from '../lib/upload'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: forums } = useSuspenseQuery(convexQuery(api.forums.list, {}))
  const { data: recentPosts } = useSuspenseQuery(convexQuery(api.posts.recent, {}))
  const { isAuthenticated } = useConvexAuth()
  const createForum = useMutation(api.forums.create)
  const generateUploadUrl = useMutation(api.media.generateUploadUrl)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(forums.length / pageSize))
  const visibleForums = forums.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount))
  }, [pageCount])

  return (
    <main className="forum-shell">
      <SiteHeader
        subtitle="The Board for Unsolved Village Phenomena"
        navLabel="Primary navigation"
        navItems={[
          { href: '/', label: 'Home' },
          { href: '/', label: 'Members' },
        ]}
      />

      <div className="forum-layout">
        <section className="forum-panel main-board" aria-labelledby="forum-heading">
          <div className="panel-heading">
            <h1 id="forum-heading">Forum</h1>
            <span>Posts</span>
          </div>

          <div className="forum-list">
            {visibleForums.map((forum) => (
              <article className="forum-row" key={forum._id}>
                {((forum as { iconUrl?: string | null }).iconUrl ?? null) ? (
                  <img
                    className="forum-uploaded-icon"
                    src={(forum as { iconUrl?: string | null }).iconUrl ?? ''}
                    alt="Forum icon"
                  />
                ) : (
                  <div className="forum-icon forum-icon-folder" aria-hidden="true" />
                )}
                <div className="forum-copy">
                  <a className="forum-title" href={`/forums/${forum.slug}`}>
                    {forum.title}
                  </a>
                  <p>{forum.description}</p>
                  <small>
                    Owner: <span className="username">{forum.creatorUsername}</span>
                    {(forum.moderatorUsernames ?? []).length > 0 ? (
                      <> / Mods: {(forum.moderatorUsernames ?? []).join(', ')}</>
                    ) : null}
                  </small>
                  {forum.lastPost ? (
                    <small>
                      {' '}
                      Last signal: {forum.lastPost.title} by{' '}
                      <span className="username">{forum.lastPost.authorUsername}</span>
                    </small>
                  ) : (
                    <small> No signals logged yet.</small>
                  )}
                </div>
                <div className="forum-count">{forum.postCount.toLocaleString()}</div>
              </article>
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            label="Forum pagination"
          />
        </section>

        <aside className="side-stack" aria-label="Forum sidebar">
          <section className="forum-panel compact-panel">
            <div className="panel-heading">
              <h2>Create Board</h2>
            </div>
            {error ? <p className="thread-empty">{error}</p> : null}
            {!isAuthenticated ? <p className="thread-empty">Sign in to create a board.</p> : null}
            <form
              className="compose-form"
              onSubmit={async (event) => {
                event.preventDefault()
                setError(null)

                const form = event.currentTarget
                const formData = new FormData(form)
                const title = String(formData.get('title') ?? '').trim()
                const description = String(formData.get('description') ?? '').trim()
                const icon = formData.get('icon')
                const iconFile = icon instanceof File && icon.size > 0 ? icon : null

                if (!title || !description) {
                  setError('Board title and description are required.')
                  return
                }

                try {
                  const iconStorageId = iconFile
                    ? await uploadImageFile(iconFile, generateUploadUrl)
                    : undefined
                  const result = await createForum({
                    title,
                    description,
                    iconStorageId,
                  })
                  form.reset()
                  await navigate({ to: `/forums/${result.slug}` })
                } catch (caughtError) {
                  setError(errorMessage(caughtError, 'Could not create board.'))
                }
              }}
            >
              <label className="compose-field">
                <span>Board title</span>
                <input
                  name="title"
                  type="text"
                  maxLength={80}
                  required
                  disabled={!isAuthenticated}
                />
              </label>
              <label className="compose-field">
                <span>Description</span>
                <textarea name="description" rows={4} required disabled={!isAuthenticated} />
              </label>
              <label className="compose-field">
                <span>Icon image</span>
                <input name="icon" type="file" accept="image/*" disabled={!isAuthenticated} />
              </label>
              <div className="compose-actions">
                <button className="thread-compose-submit" type="submit" disabled={!isAuthenticated}>
                  Create board
                </button>
              </div>
            </form>
          </section>

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
