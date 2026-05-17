import { v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'

async function enrichPost(ctx: QueryCtx, post: Doc<'posts'>) {
  const [author, forum] = await Promise.all([ctx.db.get(post.authorId), ctx.db.get(post.forumId)])

  return {
    ...post,
    authorUsername: author?.username ?? 'Unknown',
    authorRole: author?.role ?? 'member',
    forumTitle: forum?.title ?? 'Unknown forum',
    forumSlug: forum?.slug ?? '',
  }
}

export const list = query({
  args: {
    forumId: v.id('forums'),
  },
  handler: async (ctx, args) => {
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

    return await Promise.all(sortedPosts.map((post) => enrichPost(ctx, post)))
  },
})

export const recent = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('posts').withIndex('by_created_at').order('desc').take(6)

    return await Promise.all(posts.map((post) => enrichPost(ctx, post)))
  },
})

export const get = query({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)

    if (!post) {
      return null
    }

    return await enrichPost(ctx, post)
  },
})

export const vote = mutation({
  args: {
    postId: v.id('posts'),
    delta: v.union(v.literal(1), v.literal(-1)),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)

    if (!post) {
      throw new Error('Post not found')
    }

    await ctx.db.patch(args.postId, {
      upvotes: post.upvotes + (args.delta === 1 ? 1 : 0),
      downvotes: post.downvotes + (args.delta === -1 ? 1 : 0),
    })

    const author = await ctx.db.get(post.authorId)

    if (author) {
      await ctx.db.patch(post.authorId, {
        reputation: author.reputation + args.delta,
      })
    }
  },
})
