import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    bio: v.string(),
    role: v.union(v.literal('member'), v.literal('moderator'), v.literal('admin')),
    postCount: v.number(),
    reputation: v.number(),
    joinedAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_email', ['email']),

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
