import { v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'
import { getVoteTransition, latestByKey, type VoteValue } from './voteState'

async function viewerVoteMap(ctx: QueryCtx, userId?: string | null) {
  const viewerId = userId ?? (await getAuthUserId(ctx))

  if (!viewerId) {
    return new Map<string, VoteValue>()
  }

  const votes = await ctx.db
    .query('postVotes')
    .withIndex('by_user', (q) => q.eq('userId', viewerId))
    .collect()

  const latestVotes = latestByKey(votes, (vote) => vote.postId)

  return new Map([...latestVotes.entries()].map(([postId, vote]) => [postId, vote.value] as const))
}

async function canModerateForum(ctx: QueryCtx, forum: Doc<'forums'>, userId: string) {
  if (forum.creatorId === userId || forum.moderatorId === userId) {
    return true
  }

  const moderatorLinks = await ctx.db
    .query('forumModerators')
    .withIndex('by_forum_user', (q) => q.eq('forumId', forum._id).eq('userId', userId))
    .collect()

  return moderatorLinks.length > 0
}

async function enrichPost(
  ctx: QueryCtx,
  post: Doc<'posts'>,
  viewerVote?: VoteValue | null,
  viewerUserId?: string | null,
) {
  const [author, forum] = await Promise.all([ctx.db.get(post.authorId), ctx.db.get(post.forumId)])
  const imageUrl = post.imageStorageId ? await ctx.storage.getUrl(post.imageStorageId) : null
  const canDelete =
    !!viewerUserId &&
    (post.authorId === viewerUserId || (forum ? await canModerateForum(ctx, forum, viewerUserId) : false))

  return {
    ...post,
    imageUrl,
    authorUsername: author?.username ?? author?.name ?? author?.email ?? 'Unknown',
    authorRole: author?.role ?? 'member',
    forumTitle: forum?.title ?? 'Unknown forum',
    forumSlug: forum?.slug ?? '',
    viewerVote: viewerVote ?? null,
    canDelete,
  }
}

export const list = query({
  args: {
    forumId: v.id('forums'),
  },
  handler: async (ctx, args) => {
    const viewerUserId = await getAuthUserId(ctx)
    const votes = await viewerVoteMap(ctx, viewerUserId)
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_forum_created_at', (q) => q.eq('forumId', args.forumId))
      .collect()
    const sortedPosts = posts.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }

      return b.createdAt - a.createdAt
    })

    return await Promise.all(
      sortedPosts.map((post) => enrichPost(ctx, post, votes.get(post._id), viewerUserId)),
    )
  },
})

export const recent = query({
  args: {},
  handler: async (ctx) => {
    const viewerUserId = await getAuthUserId(ctx)
    const votes = await viewerVoteMap(ctx, viewerUserId)
    const posts = await ctx.db.query('posts').withIndex('by_created_at').order('desc').take(6)

    return await Promise.all(posts.map((post) => enrichPost(ctx, post, votes.get(post._id), viewerUserId)))
  },
})

export const get = query({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const viewerUserId = await getAuthUserId(ctx)
    const votes = await viewerVoteMap(ctx, viewerUserId)
    const post = await ctx.db.get(args.postId)

    if (!post) {
      return null
    }

    return await enrichPost(ctx, post, votes.get(post._id), viewerUserId)
  },
})

export const vote = mutation({
  args: {
    postId: v.id('posts'),
    delta: v.union(v.literal(1), v.literal(-1)),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error('You need to be signed in to vote.')
    }

    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const votes = await ctx.db
      .query('postVotes')
      .withIndex('by_post_user', (q) => q.eq('postId', args.postId))
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
              postId: args.postId,
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

    await ctx.db.patch(args.postId, {
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
      await ctx.db.insert('postVotes', {
        userId,
        postId: args.postId,
        value: transition.nextVote,
        createdAt: now,
        updatedAt: now,
      })
    }

    const author = await ctx.db.get(post.authorId)

    if (author) {
      await ctx.db.patch(post.authorId, {
        reputation: (author.reputation ?? 0) + transition.reputationDelta,
      })
    }

    return { viewerVote: transition.nextVote }
  },
})

export const create = mutation({
  args: {
    forumId: v.id('forums'),
    title: v.string(),
    content: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    const title = args.title.trim()
    const content = args.content.trim()

    if (!userId) {
      throw new Error('You need to be signed in to post.')
    }

    if (!title || !content) {
      throw new Error('Title and content are required.')
    }

    const forum = await ctx.db.get(args.forumId)

    if (!forum) {
      throw new Error('Forum not found')
    }

    const now = Date.now()
    const postId = await ctx.db.insert('posts', {
      authorId: userId,
      forumId: args.forumId,
      title,
      content,
      imageStorageId: args.imageStorageId,
      createdAt: now,
      updatedAt: now,
      upvotes: 0,
      downvotes: 0,
      isPinned: false,
      isLocked: false,
    })

    const author = await ctx.db.get(userId)

    if (author) {
      await ctx.db.patch(userId, {
        postCount: (author.postCount ?? 0) + 1,
      })
    }

    return { postId }
  },
})

export const deletePost = mutation({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error('You need to be signed in to delete a post.')
    }

    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const forum = await ctx.db.get(post.forumId)

    if (!forum) {
      throw new Error('Forum not found')
    }

    if (!(post.authorId === userId || (await canModerateForum(ctx, forum, userId)))) {
      throw new Error('You do not have permission to delete this post.')
    }

    const postVotes = await ctx.db
      .query('postVotes')
      .withIndex('by_post_user', (q) => q.eq('postId', args.postId))
      .collect()
    const latestPostVotes = latestByKey(postVotes, (vote) => vote.userId)
    const postReputationDelta = [...latestPostVotes.values()].reduce((sum, vote) => sum + vote.value, 0)

    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post_created_at', (q) => q.eq('postId', args.postId))
      .collect()

    if (post.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId)
    }

    for (const comment of comments) {
      const commentVotes = await ctx.db
        .query('commentVotes')
        .withIndex('by_comment_user', (q) => q.eq('commentId', comment._id))
        .collect()
      const latestCommentVotes = latestByKey(commentVotes, (vote) => vote.userId)
      const commentReputationDelta = [...latestCommentVotes.values()].reduce(
        (sum, vote) => sum + vote.value,
        0,
      )

      const commentAuthor = await ctx.db.get(comment.authorId)

      if (comment.content && comment.imageStorageId) {
        await ctx.storage.delete(comment.imageStorageId)
      }

      if (commentAuthor && commentReputationDelta !== 0) {
        await ctx.db.patch(comment.authorId, {
          reputation: (commentAuthor.reputation ?? 0) - commentReputationDelta,
        })
      }

      for (const vote of commentVotes) {
        await ctx.db.delete(vote._id)
      }

      await ctx.db.delete(comment._id)
    }

    const postAuthor = await ctx.db.get(post.authorId)

    if (postAuthor) {
      await ctx.db.patch(post.authorId, {
        postCount: Math.max(0, (postAuthor.postCount ?? 0) - 1),
        reputation:
          postReputationDelta === 0
            ? postAuthor.reputation ?? 0
            : (postAuthor.reputation ?? 0) - postReputationDelta,
      })
    }

    for (const vote of postVotes) {
      await ctx.db.delete(vote._id)
    }

    await ctx.db.delete(args.postId)

    return { deleted: true }
  },
})
