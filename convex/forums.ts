import { v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation, query } from './_generated/server'

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function displayName(user: { username?: string; name?: string; email?: string } | null) {
  return user?.username ?? user?.name ?? user?.email ?? 'Unknown'
}

async function forumModerators(ctx: QueryCtx, forumId: Doc<'forums'>['_id']) {
  const moderatorLinks = await ctx.db
    .query('forumModerators')
    .withIndex('by_forum', (q) => q.eq('forumId', forumId))
    .collect()

  const moderators = await Promise.all(moderatorLinks.map((link) => ctx.db.get(link.userId)))

  return moderators.map((moderator) => displayName(moderator)).filter((name) => name !== 'Unknown')
}

async function forumOwnerUsername(ctx: QueryCtx, forum: Doc<'forums'>) {
  if (forum.creatorId) {
    return displayName(await ctx.db.get(forum.creatorId))
  }

  const moderatorLinks = await ctx.db
    .query('forumModerators')
    .withIndex('by_forum', (q) => q.eq('forumId', forum._id))
    .collect()

  const firstModerator = moderatorLinks[0]

  if (!firstModerator) {
    return 'Unknown'
  }

  return displayName(await ctx.db.get(firstModerator.userId))
}

async function forumIconUrl(ctx: QueryCtx, forum: Doc<'forums'>) {
  if (!forum.iconStorageId) {
    return null
  }

  return await ctx.storage.getUrl(forum.iconStorageId)
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const forums = await ctx.db.query('forums').withIndex('by_sort_order').collect()

    return await Promise.all(
      forums.map(async (forum) => {
        const posts = await ctx.db
          .query('posts')
          .withIndex('by_forum_created_at', (q) => q.eq('forumId', forum._id))
          .collect()
        const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt)
        const lastPost = sortedPosts[0]
        const author = lastPost ? await ctx.db.get(lastPost.authorId) : null
        const moderatorUsernames = await forumModerators(ctx, forum._id)
        const creatorUsername = await forumOwnerUsername(ctx, forum)
        const iconUrl = await forumIconUrl(ctx, forum)

        return {
          ...forum,
          creatorUsername,
          moderatorUsernames,
          iconUrl,
          postCount: posts.length,
          lastPost: lastPost
            ? {
                _id: lastPost._id,
                title: lastPost.title,
                createdAt: lastPost.createdAt,
                authorUsername: author?.username ?? author?.name ?? author?.email ?? 'Unknown',
              }
            : null,
        }
      }),
    )
  },
})

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const forum = await ctx.db
      .query('forums')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .collect()

    if (forum.length === 0) {
      return null
    }

    const [matchedForum] = forum
    const moderatorUsernames = await forumModerators(ctx, matchedForum._id)
    const creatorUsername = await forumOwnerUsername(ctx, matchedForum)
    const iconUrl = await forumIconUrl(ctx, matchedForum)

    const posts = await ctx.db
      .query('posts')
      .withIndex('by_forum_created_at', (q) => q.eq('forumId', matchedForum._id))
      .collect()

    return {
      ...matchedForum,
      creatorUsername,
      moderatorUsernames,
      iconUrl,
      postCount: posts.length,
    }
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    iconStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    const title = args.title.trim()
    const description = args.description.trim()

    if (!userId) {
      throw new Error('You need to be signed in to create a board.')
    }

    if (!title || !description) {
      throw new Error('Board title and description are required.')
    }

    const slugBase = slugify(title)

    if (!slugBase) {
      throw new Error('Board title must contain letters or numbers.')
    }

    const existingForums = await ctx.db.query('forums').collect()
    const takenSlugs = new Set(existingForums.map((forum) => forum.slug))

    let slug = slugBase
    let suffix = 2

    while (takenSlugs.has(slug)) {
      slug = `${slugBase}-${suffix}`
      suffix += 1
    }

    const sortOrder = existingForums.reduce((max, forum) => Math.max(max, forum.sortOrder), 0) + 1

    const forumId = await ctx.db.insert('forums', {
      title,
      slug,
      description,
      category: 'Forum',
      sortOrder,
      icon: 'folder',
      iconStorageId: args.iconStorageId,
      creatorId: userId,
    })

    await ctx.db.insert('forumModerators', {
      forumId,
      userId,
      addedAt: Date.now(),
    })

    return { forumId, slug }
  },
})
