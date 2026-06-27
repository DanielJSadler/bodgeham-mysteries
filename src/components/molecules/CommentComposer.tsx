import { useState } from 'react'

import { useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { errorMessage } from '../../lib/forum'

type CommentComposerProps = {
  postId: Id<'posts'>
  isAuthenticated: boolean
}

export function CommentComposer({ postId, isAuthenticated }: CommentComposerProps) {
  const createComment = useMutation(api.comments.create)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="compose-form comment-form"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        const form = event.currentTarget

        const formData = new FormData(form)
        const content = String(formData.get('content') ?? '').trim()

        if (!content) {
          setError('Comment cannot be empty.')
          return
        }

        try {
          await createComment({ postId, content })
          form.reset()
        } catch (caughtError) {
          setError(errorMessage(caughtError, 'Could not add comment.'))
        }
      }}
    >
      {error ? <p className="thread-empty">{error}</p> : null}
      {!isAuthenticated ? <p className="thread-empty">Sign in to comment.</p> : null}
      <label className="compose-field">
        <span>Add a comment</span>
        <textarea name="content" rows={4} required disabled={!isAuthenticated} />
      </label>
      <div className="compose-actions">
        <button className="thread-compose-submit" type="submit" disabled={!isAuthenticated}>
          Reply
        </button>
      </div>
    </form>
  )
}
