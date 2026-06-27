import { useState } from 'react'

import { useMutation } from 'convex/react'

import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { errorMessage } from '../../lib/forum'
import { uploadImageFile } from '../../lib/upload'

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
  const generateUploadUrl = useMutation(api.media.generateUploadUrl)
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
        const image = formData.get('image')
        const imageFile = image instanceof File && image.size > 0 ? image : null

        if (!content) {
          setError('Comment cannot be empty.')
          return
        }

        try {
          const imageStorageId = imageFile
            ? await uploadImageFile(imageFile, generateUploadUrl)
            : undefined
          await createComment({
            postId,
            parentCommentId: parentCommentId ?? undefined,
            content,
            imageStorageId,
          })
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
      <label className="compose-field">
        <span>Image</span>
        <input name="image" type="file" accept="image/*" disabled={!isAuthenticated} />
      </label>
      <div className="compose-actions">
        <button className="thread-compose-submit" type="submit" disabled={!isAuthenticated}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
