import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { getVoteTransition, latestByKey, type VoteValue } from './voteState'

async function viewerVoteMap(ctx: QueryCtx, userId?: string | null) {
  const viewerId = userId ?? (await getAuthUserId(ctx))

  if (!viewerId) {
    return new Map<string, VoteValue>()
  }

  const votes = await ctx.db
    .query('commentVotes')
    .withIndex('by_user', (q) => q.eq('userId', viewerId))
    .collect()

  const latestVotes = latestByKey(votes, (vote) => vote.commentId)

  return new Map([...latestVotes.entries()].map(([commentId, vote]) => [commentId, vote.value] as const))
}

async function canModerateForum(ctx: QueryCtx, forumId: Doc<'forums'>['_id'], userId: string) {
  const forum = await ctx.db.get(forumId)

  if (!forum) {
    return false
  }

  if (forum.creatorId === userId || forum.moderatorId === userId) {
    return true
  }

  const moderatorLinks = await ctx.db
    .query('forumModerators')
    .withIndex('by_forum_user', (q) => q.eq('forumId', forumId).eq('userId', userId))
    .collect()

  return moderatorLinks.length > 0
}

async function enrichComment(
  ctx: QueryCtx,
  comment: Doc<'comments'>,
  viewerVote?: VoteValue | null,
  canDelete = false,
) {
  const author = await ctx.db.get(comment.authorId)
  const upvotes = comment.upvotes ?? 0
  const downvotes = comment.downvotes ?? 0

  return {
    ...comment,
    upvotes,
    downvotes,
    authorUsername: author?.username ?? author?.name ?? author?.email ?? 'Unknown',
    authorRole: author?.role ?? 'member',
    viewerVote: viewerVote ?? null,
    canDelete,
  }
}

function compareComments(a: Doc<'comments'>, b: Doc<'comments'>, sortMode: 'newest' | 'mostPopular' | 'leastPopular') {
  const score = (comment: Doc<'comments'>) => (comment.upvotes ?? 0) - (comment.downvotes ?? 0)

  switch (sortMode) {
    case 'mostPopular':
      return score(b) - score(a) || b.createdAt - a.createdAt
    case 'leastPopular':
      return score(a) - score(b) || a.createdAt - b.createdAt
    case 'newest':
    default:
      return b.createdAt - a.createdAt
  }
}

export const listByPost = query({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const viewerUserId = await getAuthUserId(ctx)
    const votes = await viewerVoteMap(ctx, viewerUserId)
    const post = await ctx.db.get(args.postId)
    const forum = post ? await ctx.db.get(post.forumId) : null
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post_created_at', (q) => q.eq('postId', args.postId))
      .collect()

    const canModerate =
      !!viewerUserId && !!forum && (await canModerateForum(ctx, forum._id, viewerUserId))

    return await Promise.all(
      comments.map((comment) =>
        enrichComment(
          ctx,
          comment,
          votes.get(comment._id),
          !!viewerUserId && (comment.authorId === viewerUserId || canModerate),
        ),
      ),
    )
  },
})

export const listByPostPage = query({
  args: {
    postId: v.id('posts'),
    sortMode: v.union(v.literal('newest'), v.literal('mostPopular'), v.literal('leastPopular')),
    cursor: v.union(v.string(), v.null()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const viewerUserId = await getAuthUserId(ctx)
    const votes = await viewerVoteMap(ctx, viewerUserId)
    const post = await ctx.db.get(args.postId)
    const forum = post ? await ctx.db.get(post.forumId) : null
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post_created_at', (q) => q.eq('postId', args.postId))
      .collect()

    const canModerate =
      !!viewerUserId && !!forum && (await canModerateForum(ctx, forum._id, viewerUserId))

    const sortedComments = [...comments].sort((a, b) => compareComments(a, b, args.sortMode))
    const start = args.cursor ? Number(args.cursor) : 0
    const page = sortedComments.slice(start, start + args.limit)
    const nextCursor = start + page.length < sortedComments.length ? String(start + page.length) : null

    return {
      comments: await Promise.all(
        page.map((comment) =>
          enrichComment(
            ctx,
            comment,
            votes.get(comment._id),
            !!viewerUserId && (comment.authorId === viewerUserId || canModerate),
          ),
        ),
      ),
      nextCursor,
    }
  },
})

export const create = mutation({
  args: {
    postId: v.id('posts'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    const content = args.content.trim()

    if (!userId) {
      throw new Error('You need to be signed in to comment.')
    }

    if (!content) {
      throw new Error('Comment cannot be empty.')
    }

    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    if (post.isLocked) {
      throw new Error('This thread is locked.')
    }

    const now = Date.now()
    const commentId = await ctx.db.insert('comments', {
      authorId: userId,
      postId: args.postId,
      content,
      createdAt: now,
      updatedAt: now,
      upvotes: 0,
      downvotes: 0,
    })

    return { commentId }
  },
})

export const vote = mutation({
  args: {
    commentId: v.id('comments'),
    delta: v.union(v.literal(1), v.literal(-1)),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error('You need to be signed in to vote.')
    }

    const comment = await ctx.db.get(args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    const votes = await ctx.db
      .query('commentVotes')
      .withIndex('by_comment_user', (q) => q.eq('commentId', args.commentId))
      .collect()
    const latestVotes = latestByKey(votes, (vote) => vote.userId)
    const existingVote = latestVotes.get(userId) ?? null
    const transition = getVoteTransition(existingVote?.value ?? null, args.delta)

    const now = Date.now()

    const nextVotesByUser = new Map(latestVotes)

    if (transition.nextVote) {
      nextVotesByUser.set(
        userId,
        existingVote
          ? { ...existingVote, value: transition.nextVote, updatedAt: now }
          : {
              userId,
              commentId: args.commentId,
              value: transition.nextVote,
              createdAt: now,
              updatedAt: now,
            },
      )
    } else {
      nextVotesByUser.delete(userId)
    }

    const updatedVotes = [...nextVotesByUser.values()]
    const upvotes = updatedVotes.filter((vote) => vote.value === 1).length
    const downvotes = updatedVotes.length - upvotes

    await ctx.db.patch(args.commentId, {
      upvotes,
      downvotes,
    })

    for (const vote of votes) {
      const keptVote = nextVotesByUser.get(vote.userId)

      if (!keptVote || keptVote._id !== vote._id) {
        await ctx.db.delete(vote._id)
      }
    }

    if (transition.nextVote && existingVote) {
      await ctx.db.patch(existingVote._id, { value: transition.nextVote, updatedAt: now })
    } else if (transition.nextVote) {
      await ctx.db.insert('commentVotes', {
        userId,
        commentId: args.commentId,
        value: transition.nextVote,
        createdAt: now,
        updatedAt: now,
      })
    }

    const author = await ctx.db.get(comment.authorId)

    if (author) {
      await ctx.db.patch(comment.authorId, {
        reputation: (author.reputation ?? 0) + transition.reputationDelta,
      })
    }

    return { viewerVote: transition.nextVote }
  },
})

export const deleteComment = mutation({
  args: {
    commentId: v.id('comments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error('You need to be signed in to delete a comment.')
    }

    const comment = await ctx.db.get(args.commentId)

    if (!comment) {
      throw new Error('Comment not found')
    }

    const post = await ctx.db.get(comment.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const canModerate = await canModerateForum(ctx, post.forumId, userId)

    if (!(comment.authorId === userId || canModerate)) {
      throw new Error('You do not have permission to delete this comment.')
    }

    await ctx.db.patch(args.commentId, {
      content: '',
      updatedAt: Date.now(),
    })

    return { deleted: true }
  },
})
