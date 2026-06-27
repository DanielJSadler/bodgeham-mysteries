import { useEffect, useRef, useState } from 'react'

import { useConvexAuth } from '@convex-dev/auth/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useConvex } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import type { ForumPost } from '../../lib/forum'
import {
  forumSortOptions,
  formatForumDate,
  type ForumSortMode,
} from '../../lib/forum'
import { CommentComposer } from '../molecules/CommentComposer'
import { SortSelect } from '../molecules/SortSelect'
import { VoteControls } from '../molecules/VoteControls'

type ThreadViewProps = {
  post: ForumPost
}

export function ThreadView({ post }: ThreadViewProps) {
  const { isAuthenticated } = useConvexAuth()
  const convex = useConvex()
  const navigate = useNavigate()
  const deleteComment = useMutation(api.comments.deleteComment)
  const deletePost = useMutation(api.posts.deletePost)
  const [error, setError] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<ForumSortMode>('newest')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const pageSize = 5
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
    queryKey: ['comments', post._id, sortMode],
    queryFn: async ({ pageParam }) =>
      convex.query(api.comments.listByPostPage, {
        postId: post._id,
        sortMode,
        cursor: pageParam ?? null,
        limit: pageSize,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  const comments = data?.pages.flatMap((page) => page.comments) ?? []

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target || !hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, comments.length, sortMode])

  return (
    <section className="forum-panel thread-panel">
      <div className="panel-heading thread-heading">
        <div>
          <h1>{post.title}</h1>
          <span>
            By <span className="username">{post.authorUsername}</span> /{' '}
            {formatForumDate(post.createdAt)}
          </span>
        </div>
        <div className="thread-post-actions">
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
                if (!window.confirm('Delete this post and its replies?')) {
                  return
                }

                setError(null)

                try {
                  await deletePost({ postId: post._id })
                  await navigate({ to: `/forums/${post.forumSlug}` })
                } catch (caughtError) {
                  setError(caughtError instanceof Error ? caughtError.message : 'Could not delete post.')
                }
              }}
            >
              Delete post
            </button>
          ) : null}
        </div>
      </div>

      <article className="post-body">
        <p>{post.content}</p>
      </article>

      <section className="comments-block" aria-labelledby="comments-heading">
        <div className="panel-heading">
          <h2 id="comments-heading">Comments</h2>
          <SortSelect
            label="Sort comments"
            value={sortMode}
            options={forumSortOptions}
            onChange={setSortMode}
          />
        </div>

        {!post.isLocked ? (
          <CommentComposer postId={post._id} isAuthenticated={isAuthenticated} />
        ) : (
          <p className="thread-empty">This thread is locked.</p>
        )}

        {error ? <p className="thread-empty">{error}</p> : null}

        <div className="comment-list">
          {isPending ? (
            <p className="thread-empty">Loading comments...</p>
          ) : comments.length ? (
            comments.map((comment) => (
              <article className="comment-row" key={comment._id}>
                <div className="comment-meta">
                  <strong className="username">{comment.authorUsername}</strong>
                  <span>{formatForumDate(comment.createdAt)}</span>
                </div>
                <p>{comment.content || '[deleted]'}</p>
                <div className="comment-actions">
                  <VoteControls
                    kind="comment"
                    itemId={comment._id}
                    upvotes={comment.upvotes}
                    downvotes={comment.downvotes}
                    viewerVote={comment.viewerVote}
                  />
                  {comment.canDelete && comment.content ? (
                    <button
                      className="thread-action-button"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Delete this comment?')) {
                          return
                        }

                        setError(null)

                        try {
                          await deleteComment({ commentId: comment._id })
                        } catch (caughtError) {
                          setError(
                            caughtError instanceof Error
                              ? caughtError.message
                              : 'Could not delete comment.',
                          )
                        }
                      }}
                    >
                      Delete comment
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="thread-empty">No comments yet.</p>
          )}
          <div ref={loadMoreRef} className="comment-load-more">
            {hasNextPage ? (
              <p className="thread-empty">{isFetchingNextPage ? 'Loading more comments...' : 'Scroll for more comments.'}</p>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  )
}
