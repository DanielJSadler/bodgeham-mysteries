import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

export const updateReputation = mutation({
  args: {
    userId: v.id('users'),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(args.userId, {
      reputation: user.reputation + args.delta,
    })
  },
})
