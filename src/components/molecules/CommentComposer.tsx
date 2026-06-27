import { useState } from 'react'

import { useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { errorMessage } from '../../lib/forum'

type CommentComposerProps = {
  postId: Id<'posts'>
  parentCommentId?: Id<'comments'> | null
  isAuthenticated: boolean
  submitLabel?: string
  onCreated?: () => void
}

export function CommentComposer({
  postId,
  parentCommentId,
  isAuthenticated,
  submitLabel = 'Reply',
  onCreated,
}: CommentComposerProps) {
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
          await createComment({ postId, parentCommentId, content })
          form.reset()
          onCreated?.()
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
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
