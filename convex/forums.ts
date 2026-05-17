import { query } from './_generated/server'

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

        return {
          ...forum,
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
