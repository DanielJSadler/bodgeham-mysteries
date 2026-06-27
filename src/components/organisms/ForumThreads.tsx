import { useConvexAuth } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'

import type { Id } from '../../../convex/_generated/dataModel'
import type { ForumThread } from '../../lib/forum'
import { ForumComposer } from '../molecules/ForumComposer'
import { ForumThreadList } from './ForumThreadList'

type ForumThreadsProps = {
  forumId: Id<'forums'>
  posts: ForumThread[]
}

export function ForumThreads({ forumId, posts }: ForumThreadsProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()

  return (
    <>
      <ForumComposer
        forumId={forumId}
        isAuthenticated={isAuthenticated}
        onCreated={(postId) => void navigate({ to: `/posts/${postId}` })}
      />
      <ForumThreadList posts={posts} />
    </>
  )
}
