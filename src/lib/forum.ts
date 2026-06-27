import type { Id } from '@convex/_generated/dataModel'

export type ForumSortMode = 'newest' | 'mostPopular' | 'leastPopular'

export type ForumSortOption = {
  value: ForumSortMode
  label: string
}

export const forumSortOptions: ForumSortOption[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'mostPopular', label: 'Most popular' },
  { value: 'leastPopular', label: 'Least popular' },
]

export type ForumThread = {
  _id: Id<'posts'>
  title: string
  content: string
  imageUrl: string | null
  authorUsername: string
  createdAt: number
  upvotes: number
  downvotes: number
  viewerVote: VoteValue | null
  isPinned: boolean
  isLocked: boolean
  canDelete: boolean
}

export type ForumComment = {
  _id: Id<'comments'>
  content: string
  imageUrl: string | null
  authorUsername: string
  createdAt: number
  upvotes: number
  downvotes: number
  viewerVote: VoteValue | null
  canDelete: boolean
  parentCommentId?: Id<'comments'> | null
  replies?: ForumComment[]
}

export type ForumPost = ForumThread & {
  forumSlug: string
  forumTitle: string
}

export type VoteValue = 1 | -1

export function formatForumDate(value: number) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

export function previewForumContent(content: string) {
  return content.length > 180 ? `${content.slice(0, 177)}...` : content
}

export function voteScore(item: { upvotes: number; downvotes: number }) {
  return item.upvotes - item.downvotes
}

export function sortForumThreads<T extends ForumThread>(items: T[], sortMode: ForumSortMode) {
  return [...items].sort((a, b) => compareForumItems(a, b, sortMode, true))
}

export function sortForumComments<T extends ForumComment>(items: T[], sortMode: ForumSortMode) {
  return [...items].sort((a, b) => compareForumItems(a, b, sortMode, false))
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function compareForumItems<
  T extends { createdAt: number; upvotes: number; downvotes: number; isPinned?: boolean },
>(a: T, b: T, sortMode: ForumSortMode, respectPinned: boolean) {
  if (respectPinned && a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1
  }

  switch (sortMode) {
    case 'mostPopular':
      return voteScore(b) - voteScore(a) || b.createdAt - a.createdAt
    case 'leastPopular':
      return voteScore(a) - voteScore(b) || a.createdAt - b.createdAt
    case 'newest':
    default:
      return b.createdAt - a.createdAt
  }
}
