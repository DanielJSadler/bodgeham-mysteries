import { v } from 'convex/values'

import { mutation } from './_generated/server'

export const touchPageVisit = mutation({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existing = await ctx.db
      .query('pageVisits' as never)
      .withIndex('by_path' as never, (q: never) => q.eq('path', args.path))
      .unique()

    if (existing) {
      const count = existing.count + 1

      await ctx.db.patch(existing._id, {
        count,
        lastVisitedAt: now,
      })

      return { count }
    }

    await ctx.db.insert('pageVisits' as never, {
      path: args.path,
      count: 1,
      lastVisitedAt: now,
    })

    return { count: 1 }
  },
})
