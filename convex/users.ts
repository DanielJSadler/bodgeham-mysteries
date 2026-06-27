import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";

function displayName(
  user: { username?: string; name?: string; email?: string } | null,
) {
  return user?.username ?? user?.name ?? user?.email ?? "Unknown";
}

type Identity = {
  name?: string;
  email?: string;
  pictureUrl?: string;
  subject?: string;
} | null;

function usernameFromIdentity(identity: Identity) {
  const name = identity?.name?.trim() ?? "";
  const email = identity?.email?.trim() ?? "";
  const subject = identity?.subject?.trim() ?? "";

  if (name) return name.replace(/\s+/g, "_");
  if (email) return email.split("@")[0];
  if (subject) return subject;

  return "Logged_in_member";
}

async function authIdentity(
  ctx: Parameters<typeof getAuthUserId>[0],
): Promise<Identity> {
  return await ctx.auth.getUserIdentity();
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const identity = await authIdentity(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return {
        _id: userId,
        username: usernameFromIdentity(identity),
        displayName: usernameFromIdentity(identity),
        email: identity?.email ?? null,
        name: identity?.name ?? null,
        image: identity?.pictureUrl ?? null,
        role: "member" as const,
        postCount: 0,
        reputation: 0,
        lastSeenAt: Date.now(),
      };
    }

    return {
      ...user,
      username:
        user.username ??
        usernameFromIdentity(identity) ??
        user.name ??
        user.email ??
        "Unknown",
      displayName: displayName(user),
      role: user.role ?? "member",
      postCount: user.postCount ?? 0,
      reputation: user.reputation ?? 0,
      lastSeenAt: user.lastSeenAt ?? null,
    };
  },
});

export const online = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    const users = await ctx.db.query('users').collect();

    return users
      .filter((user) => (user.lastSeenAt ?? 0) >= cutoff)
      .sort(
        (a, b) =>
          (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0) ||
          (a.username ?? a.name ?? a.email ?? 'Unknown').localeCompare(
            b.username ?? b.name ?? b.email ?? 'Unknown',
          ),
      )
      .map((user) => ({
        _id: user._id,
        username: user.username ?? user.name ?? user.email ?? 'Unknown',
        lastSeenAt: user.lastSeenAt ?? null,
      }));
  },
});

export const touchActivity = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    await ctx.db.patch(userId, {
      lastSeenAt: Date.now(),
    });

    return null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateReputation = mutation({
  args: {
    userId: v.id("users"),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      reputation: (user.reputation ?? 0) + args.delta,
    });
  },
});

export const touchPresence = mutation({
  args: {
    visitorId: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('visitorSessions')
      .withIndex('by_visitor', (q) => q.eq('visitorId', args.visitorId))
      .unique();

    const next = {
      visitorId: args.visitorId,
      lastSeenAt: now,
      ...(args.username ? { username: args.username } : {}),
    };

    if (existing) {
      await ctx.db.patch(existing._id, next);
      return existing._id;
    }

    return await ctx.db.insert('visitorSessions', next);
  },
});

export const onlineCount = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    const sessions = await ctx.db.query('visitorSessions').collect();

    return sessions.filter((session) => session.lastSeenAt >= cutoff).length;
  },
});
