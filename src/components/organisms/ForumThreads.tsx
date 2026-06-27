import { useEffect, useState } from 'react'

import { useConvexAuth } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'

import type { Id } from '@convex/_generated/dataModel'
import type { ForumThread } from '../../lib/forum'
import { Pagination } from '../atoms/Pagination'
import { ForumComposer } from '../molecules/ForumComposer'
import { ForumThreadList } from './ForumThreadList'

type ForumThreadsProps = {
  forumId: Id<'forums'>
  posts: ForumThread[]
}

export function ForumThreads({ forumId, posts }: ForumThreadsProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize))

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount))
  }, [pageCount])

  const visiblePosts = posts.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <ForumComposer
        forumId={forumId}
        isAuthenticated={isAuthenticated}
        onCreated={(postId) => void navigate({ to: `/posts/${postId}` })}
      />
      <ForumThreadList posts={visiblePosts} />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} label="Thread pagination" />
    </>
  )
}
