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
    creatorId: v.optional(v.id('users')),
    creatorUsername: v.optional(v.string()),
    moderatorId: v.optional(v.id('users')),
    moderatorUsername: v.optional(v.string()),
    postCount: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_sort_order', ['sortOrder']),

  forumModerators: defineTable({
    forumId: v.id('forums'),
    userId: v.id('users'),
    addedAt: v.number(),
  })
    .index('by_forum', ['forumId'])
    .index('by_forum_user', ['forumId', 'userId'])
    .index('by_user', ['userId']),

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
    .index('by_forum_created_at', ['forumId', 'createdAt']),

  postVotes: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
    value: v.union(v.literal(1), v.literal(-1)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_post_user', ['postId', 'userId'])
    .index('by_user', ['userId']),

  comments: defineTable({
    authorId: v.id('users'),
    postId: v.id('posts'),
    parentCommentId: v.optional(v.id('comments')),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    upvotes: v.optional(v.number()),
    downvotes: v.optional(v.number()),
  })
    .index('by_post_created_at', ['postId', 'createdAt'])
    .index('by_created_at', ['createdAt']),

  commentVotes: defineTable({
    userId: v.id('users'),
    commentId: v.id('comments'),
    value: v.union(v.literal(1), v.literal(-1)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_comment_user', ['commentId', 'userId'])
    .index('by_user', ['userId']),
})
