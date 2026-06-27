import { useState } from 'react'

import { useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { formatForumDate, previewForumContent, type ForumThread } from '../../lib/forum'
import { VoteControls } from '../molecules/VoteControls'

type ForumThreadListProps = {
  posts: ForumThread[]
}

export function ForumThreadList({ posts }: ForumThreadListProps) {
  const deletePost = useMutation(api.posts.deletePost)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="thread-list">
      {error ? <p className="thread-empty">{error}</p> : null}
      {posts.length ? (
        posts.map((post) => (
            <article className="thread-row" key={post._id}>
            <div className="thread-copy">
              <a className="thread-title" href={`/posts/${post._id}`}>
                {post.title}
              </a>
              {post.imageUrl ? <img className="post-image" src={post.imageUrl} alt="Post attachment" /> : null}
              <p>{previewForumContent(post.content)}</p>
              <small>
                By <span className="username">{post.authorUsername}</span> /{' '}
                {formatForumDate(post.createdAt)}
              </small>
            </div>
            <div className="thread-badges">
              <VoteControls
                kind="post"
                itemId={post._id}
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                viewerVote={post.viewerVote}
              />
              {post.canDelete ? (
                <button
                  className="thread-action-button"
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Delete this post?')) {
                      return
                    }

                    setError(null)

                    try {
                      await deletePost({ postId: post._id })
                    } catch (caughtError) {
                      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete post.')
                    }
                  }}
                >
                  Delete
                </button>
              ) : null}
              {post.isPinned ? <span>Pinned</span> : null}
              {post.isLocked ? <span>Locked</span> : null}
            </div>
          </article>
        ))
      ) : (
        <p className="thread-empty">No threads here yet. Start the first one.</p>
      )}
    </div>
  )
}
