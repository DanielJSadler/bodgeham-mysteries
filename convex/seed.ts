import { mutation } from './_generated/server'

const DAY = 24 * 60 * 60 * 1000

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUsers = await ctx.db.query('users').take(1)

    if (existingUsers.length > 0) {
      return { seeded: false, reason: 'Seed data already exists.' }
    }

    const now = Date.now()

    const users = await Promise.all(
      [
        {
          username: 'Sherlock_H0mes',
          email: 'sherlock@example.com',
          avatarUrl: '/avatars/sherlock.gif',
          bio: 'Keeps a ledger of every odd footprint in Bodgeham.',
          role: 'moderator' as const,
          postCount: 0,
          reputation: 42,
          joinedAt: now - 380 * DAY,
        },
        {
          username: 'ghost_hunter_99',
          email: 'ghosthunter99@example.com',
          avatarUrl: '/avatars/ghost-hunter.gif',
          bio: 'Never leaves home without fresh batteries.',
          role: 'member' as const,
          postCount: 0,
          reputation: 17,
          joinedAt: now - 220 * DAY,
        },
        {
          username: 'Moriarty',
          email: 'moriarty@example.com',
          avatarUrl: '/avatars/moriarty.gif',
          bio: 'Insists every coincidence is deliberate.',
          role: 'member' as const,
          postCount: 0,
          reputation: -3,
          joinedAt: now - 140 * DAY,
        },
        {
          username: 'daneel',
          email: 'daneel@example.com',
          avatarUrl: '/avatars/daneel.gif',
          bio: 'Administrator, archivist, occasional tea brewer.',
          role: 'admin' as const,
          postCount: 0,
          reputation: 83,
          joinedAt: now - 520 * DAY,
        },
        {
          username: 'Willow_Smith',
          email: 'willow@example.com',
          avatarUrl: '/avatars/willow.gif',
          bio: 'Maps sightings by moon phase.',
          role: 'member' as const,
          postCount: 0,
          reputation: 28,
          joinedAt: now - 96 * DAY,
        },
        {
          username: 'Lady_Eliza',
          email: 'eliza@example.com',
          avatarUrl: '/avatars/eliza.gif',
          bio: 'Keeper of the oldest rumours in the village.',
          role: 'moderator' as const,
          postCount: 0,
          reputation: 59,
          joinedAt: now - 300 * DAY,
        },
      ].map((user) => ctx.db.insert('users', user)),
    )

    const [sherlock, ghostHunter, moriarty, daneel, willow, eliza] = users

    const forums = await Promise.all(
      [
        {
          title: '/SIGNAL_LOSS',
          slug: 'signal-loss',
          description: 'General discussion, introductions, and suspicious village chatter.',
          category: 'Forum',
          sortOrder: 1,
          icon: 'folder',
          creatorId: daneel,
        },
        {
          title: '/ORBITAL_ANOMALIES',
          slug: 'orbital-anomalies',
          description: 'Lights in the sky, strange signals, and unexplained flyovers.',
          category: 'Forum',
          sortOrder: 2,
          icon: 'planet',
          creatorId: sherlock,
        },
        {
          title: '/DEEP_FIELD_GHOSTS',
          slug: 'deep-field-ghosts',
          description: 'Paranormal reports from Bodgeham and the surrounding lanes.',
          category: 'Forum',
          sortOrder: 3,
          icon: 'comet',
          creatorId: eliza,
        },
        {
          title: '/THE_UPKEEP',
          slug: 'the-upkeep',
          description: 'Site news, archived notices, and moderator housekeeping.',
          category: 'Forum',
          sortOrder: 4,
          icon: 'news',
          creatorId: daneel,
        },
      ].map((forum) => ctx.db.insert('forums', forum)),
    )

    const [signalLoss, orbitalAnomalies, deepFieldGhosts, upkeep] = forums

    await Promise.all(
      [
        { forumId: signalLoss, userId: daneel },
        { forumId: orbitalAnomalies, userId: sherlock },
        { forumId: deepFieldGhosts, userId: eliza },
        { forumId: upkeep, userId: daneel },
      ].map((moderator) =>
        ctx.db.insert('forumModerators', {
          ...moderator,
          addedAt: now,
        }),
      ),
    )

    const posts = [
      {
        authorId: daneel,
        forumId: signalLoss,
        title: 'WELCOME: Read before posting sightings',
        content:
          'Please include date, location, weather, witnesses, and whether you had been at The Black Badger beforehand.',
        createdAt: now - 21 * DAY,
        updatedAt: now - 20 * DAY,
        upvotes: 34,
        downvotes: 1,
        isPinned: true,
        isLocked: false,
      },
      {
        authorId: eliza,
        forumId: signalLoss,
        title: 'Has anyone else heard tapping from the old telegraph box?',
        content: 'Three nights running, always at 01:13. It stops when the church clock rings.',
        createdAt: now - 6 * DAY,
        updatedAt: now - 5 * DAY,
        upvotes: 18,
        downvotes: 2,
        isPinned: true,
        isLocked: false,
      },
      {
        authorId: moriarty,
        forumId: signalLoss,
        title: 'The post office noticeboard has been rearranged',
        content: 'Not vandalised. Rearranged. The pinholes line up like a crude map.',
        createdAt: now - 2 * DAY,
        updatedAt: now - 2 * DAY,
        upvotes: 7,
        downvotes: 9,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: ghostHunter,
        forumId: orbitalAnomalies,
        title: 'Green pulse above Mill Hill at 23:48',
        content:
          'Caught a faint glow on my camcorder. Could be a plane, but it changed direction without banking.',
        createdAt: now - 3 * DAY,
        updatedAt: now - 3 * DAY,
        upvotes: 26,
        downvotes: 4,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: willow,
        forumId: orbitalAnomalies,
        title: 'Repeating numbers station on 9.721 MHz',
        content: 'Sequence repeats every 47 minutes. Last digit changes after midnight.',
        createdAt: now - 9 * DAY,
        updatedAt: now - 8 * DAY,
        upvotes: 22,
        downvotes: 0,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: sherlock,
        forumId: orbitalAnomalies,
        title: 'Lanterns, drones, or something worse?',
        content:
          'Before this spirals: compare the churchyard sightings against market-night lantern releases.',
        createdAt: now - 14 * DAY,
        updatedAt: now - 13 * DAY,
        upvotes: 31,
        downvotes: 5,
        isPinned: false,
        isLocked: true,
      },
      {
        authorId: eliza,
        forumId: deepFieldGhosts,
        title: 'The weeping lady of Hollow Lane',
        content: 'My aunt saw her in 1968. The description has not changed in fifty years.',
        createdAt: now - 4 * DAY,
        updatedAt: now - 4 * DAY,
        upvotes: 39,
        downvotes: 3,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: ghostHunter,
        forumId: deepFieldGhosts,
        title: 'EVP from the closed railway cutting',
        content: 'Audio is messy, but there is definitely a second voice under mine.',
        createdAt: now - 11 * DAY,
        updatedAt: now - 10 * DAY,
        upvotes: 15,
        downvotes: 6,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: daneel,
        forumId: upkeep,
        title: 'Archive migration complete',
        content:
          'Old witness reports have been copied into the new database. Broken links should be reported here.',
        createdAt: now - 1 * DAY,
        updatedAt: now - 1 * DAY,
        upvotes: 12,
        downvotes: 0,
        isPinned: false,
        isLocked: false,
      },
      {
        authorId: sherlock,
        forumId: upkeep,
        title: 'Moderator note: keep reports factual',
        content: 'Speculation is welcome, personal accusations are not.',
        createdAt: now - 18 * DAY,
        updatedAt: now - 18 * DAY,
        upvotes: 27,
        downvotes: 2,
        isPinned: false,
        isLocked: true,
      },
    ]

    for (const post of posts) {
      await ctx.db.insert('posts', post)
    }

    const postCounts = new Map(users.map((userId) => [userId, 0]))

    for (const post of posts) {
      postCounts.set(post.authorId, (postCounts.get(post.authorId) ?? 0) + 1)
    }

    await Promise.all(
      [...postCounts.entries()].map(async ([userId, postCount]) => {
        const user = await ctx.db.get(userId)

        if (user) {
          await ctx.db.patch(userId, { postCount })
        }
      }),
    )

    return { seeded: true, users: users.length, forums: forums.length, posts: posts.length }
  },
})
