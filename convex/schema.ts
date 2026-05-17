import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.union(v.literal('member'), v.literal('moderator'), v.literal('admin'))),
    postCount: v.optional(v.number()),
    reputation: v.optional(v.number()),
    joinedAt: v.optional(v.number()),
  })
    .index('email', ['email'])
    .index('phone', ['phone'])
    .index('by_username', ['username']),

  forums: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    category: v.string(),
    sortOrder: v.number(),
    icon: v.string(),
  })
    .index('by_slug', ['slug'])
    .index('by_sort_order', ['sortOrder']),

  posts: defineTable({
    authorId: v.id('users'),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    upvotes: v.number(),
    downvotes: v.number(),
    forumId: v.id('forums'),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
  })
    .index('by_forum', ['forumId'])
    .index('by_created_at', ['createdAt'])
    .index('by_forum_created_at', ['forumId', 'createdAt'])
})
