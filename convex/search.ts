import { v } from 'convex/values'

import { query } from './_generated/server'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/g)
    .map((part) => part.trim())
    .filter(Boolean)
}

function scoreText(source: string, query: string, tokens: string[]) {
  const haystack = normalize(source)
  let score = 0

  if (!query) {
    return 0
  }

  if (haystack === query) {
    score += 1000
  }

  if (haystack.startsWith(query)) {
    score += 500
  }

  if (haystack.includes(query)) {
    score += 250
  }

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 20
    }
  }

  return score
}

function rankScore(fields: string[], query: string) {
  const tokens = tokenize(query)
  return fields.reduce((score, field, index) => score + scoreText(field, query, tokens) / (index + 1), 0)
}

export const search = query({
  args: {
    q: v.string(),
  },
  handler: async (ctx, args) => {
    const q = normalize(args.q)

    if (!q) {
      return {
        forums: [],
        posts: [],
      }
    }

    const [forums, posts] = await Promise.all([
      ctx.db.query('forums').collect(),
      ctx.db.query('posts').collect(),
    ])

    const forumHits = forums
      .map((forum) => ({
        score: rankScore([forum.title, forum.description, forum.category], q),
        title: forum.title,
        description: forum.description,
        forum,
      }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))

    const postHits = posts
      .map((post) => {
        const forum = forums.find((item) => item._id === post.forumId)
        return {
          score: rankScore([post.title, post.content, forum?.title ?? ''], q),
          title: post.title,
          description: post.content,
          post,
          forum,
          createdAt: post.createdAt,
        }
      })
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))

    return {
      forums: forumHits.slice(0, 10).map((hit) => ({
        _id: hit.forum._id,
        title: hit.forum.title,
        slug: hit.forum.slug,
        description: hit.forum.description,
        postCount: hit.forum.postCount ?? 0,
        score: hit.score,
      })),
      posts: postHits.slice(0, 20).map((hit) => ({
        _id: hit.post._id,
        title: hit.post.title,
        content: hit.post.content,
        forumTitle: hit.forum?.title ?? 'Unknown forum',
        forumSlug: hit.forum?.slug ?? '',
        createdAt: hit.createdAt,
        score: hit.score,
      })),
    }
  },
})
