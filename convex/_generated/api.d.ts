/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as forums from "../forums.js";
import type * as http from "../http.js";
import type * as media from "../media.js";
import type * as passwordReset from "../passwordReset.js";
import type * as posts from "../posts.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as visits from "../visits.js";
import type * as voteState from "../voteState.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  forums: typeof forums;
  http: typeof http;
  media: typeof media;
  passwordReset: typeof passwordReset;
  posts: typeof posts;
  search: typeof search;
  seed: typeof seed;
  users: typeof users;
  visits: typeof visits;
  voteState: typeof voteState;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
