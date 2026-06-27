import { useConvexAuth } from '@convex-dev/auth/react'
import { useMutation } from 'convex/react'

import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import type { VoteValue } from '../../lib/forum'
import { voteScore } from '../../lib/forum'

type VoteControlsProps = {
  kind: 'post' | 'comment'
  itemId: Id<'posts'> | Id<'comments'>
  upvotes: number
  downvotes: number
  viewerVote: VoteValue | null
}

export function VoteControls({ kind, itemId, upvotes, downvotes, viewerVote }: VoteControlsProps) {
  const { isAuthenticated } = useConvexAuth()
  const votePost = useMutation(api.posts.vote)
  const voteComment = useMutation(api.comments.vote)
  const score = voteScore({ upvotes, downvotes })

  return (
    <div className="vote-controls" aria-label={`${kind} voting controls`}>
      <button
        className={`vote-button ${viewerVote === 1 ? 'vote-button-active' : ''}`.trim()}
        type="button"
        aria-pressed={viewerVote === 1}
        disabled={!isAuthenticated}
        onClick={() => {
          void (kind === 'post'
            ? votePost({ postId: itemId as Id<'posts'>, delta: 1 })
            : voteComment({ commentId: itemId as Id<'comments'>, delta: 1 }))
        }}
      >
        ▲
      </button>
      <span className="vote-score">{score}</span>
      <button
        className={`vote-button ${viewerVote === -1 ? 'vote-button-active' : ''}`.trim()}
        type="button"
        aria-pressed={viewerVote === -1}
        disabled={!isAuthenticated}
        onClick={() => {
          void (kind === 'post'
            ? votePost({ postId: itemId as Id<'posts'>, delta: -1 })
            : voteComment({ commentId: itemId as Id<'comments'>, delta: -1 }))
        }}
      >
        ▼
      </button>
    </div>
  )
}
