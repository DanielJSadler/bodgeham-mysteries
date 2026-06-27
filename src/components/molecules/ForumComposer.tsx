import { useState } from 'react'

import { useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { errorMessage } from '../../lib/forum'

type ForumComposerProps = {
  forumId: Id<'forums'>
  isAuthenticated: boolean
  onCreated: (postId: Id<'posts'>) => void
}

export function ForumComposer({ forumId, isAuthenticated, onCreated }: ForumComposerProps) {
  const createPost = useMutation(api.posts.create)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <div className="panel-heading thread-heading thread-heading-actions">
        <button
          className="thread-compose-toggle"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          + New Post
        </button>
      </div>

      {isOpen ? (
        <form
          className="compose-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setError(null)
            const form = event.currentTarget

            const formData = new FormData(form)
            const title = String(formData.get('title') ?? '').trim()
            const content = String(formData.get('content') ?? '').trim()

            if (!title || !content) {
              setError('Title and message are required.')
              return
            }

            try {
              const result = await createPost({ forumId, title, content })
              form.reset()
              setIsOpen(false)
              onCreated(result.postId)
            } catch (caughtError) {
              setError(errorMessage(caughtError, 'Could not create post.'))
            }
          }}
        >
          {error ? <p className="thread-empty">{error}</p> : null}
          {!isAuthenticated ? <p className="thread-empty">Sign in to post a new thread.</p> : null}
          <label className="compose-field">
            <span>Title</span>
            <input name="title" type="text" maxLength={120} required disabled={!isAuthenticated} />
          </label>
          <label className="compose-field">
            <span>Message</span>
            <textarea name="content" rows={5} required disabled={!isAuthenticated} />
          </label>
          <div className="compose-actions">
            <button className="thread-compose-submit" type="submit" disabled={!isAuthenticated}>
              Post thread
            </button>
          </div>
        </form>
      ) : null}
    </>
  )
}
