import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import type { DataModel } from "./_generated/dataModel";
import { PasswordResetToken } from "./passwordReset";

function stringParam(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function usernameFromProfile(profile: Record<string, unknown>) {
  const username = stringParam(profile.username);
  const name = stringParam(profile.name);
  const email = stringParam(profile.email);

  if (username) return username;
  if (name) return name.replace(/\s+/g, "_");
  if (email) return email.split("@")[0];

  return "new_member";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
    Password<DataModel>({
      reset: PasswordResetToken,
      profile(params) {
        const email = stringParam(params.email).toLowerCase();
        const username = stringParam(params.username);
        const name =
          stringParam(params.name) || username || email.split("@")[0];

        if (!email.includes("@")) {
          throw new Error("Enter a valid email address.");
        }

        return {
          email,
          name,
          username: username || name.replace(/\s+/g, "_"),
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      const user = await ctx.db.get(args.userId);

      if (!user) return;

      await ctx.db.patch(args.userId, {
        username: user.username ?? usernameFromProfile(args.profile),
        avatarUrl: user.avatarUrl ?? user.image ?? "",
        bio: user.bio ?? "Newly registered mystery board member.",
        role: user.role ?? "member",
        postCount: user.postCount ?? 0,
        reputation: user.reputation ?? 0,
        joinedAt: user.joinedAt ?? Date.now(),
        lastSeenAt: user.lastSeenAt ?? Date.now(),
      });
    },
  },
});
