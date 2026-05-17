# Bodgeham Mysteries — Build Plan

## Overview
Convert the starter scaffold into a 90s/2000s‑style mystery forum homepage.
Visual reference: classic phpBB / Invision Power Board with a dark, eerie theme.

---

## 1. Data Model (Convex Schema)

**Reference image:** `reference.png` — the visual design should match this.

### `users` table
| Field         | Type       | Notes                        |
|---------------|------------|------------------------------|
| `_id`         | `Id`       | auto                         |
| `_creationTime` | `number` | auto                       |
| `username`    | `string`   | unique display name          |
| `email`       | `string`   | unique, for future auth      |
| `avatarUrl`   | `string`   | URL to avatar image          |
| `bio`         | `string`   | short bio text               |
| `role`        | `string`   | "member" / "moderator" / "admin" |
| `postCount`   | `number`   | denormalized counter         |
| `reputation`  | `number`   | upvotes - downvotes sum      |
| `joinedAt`    | `number`   | timestamp                    |

### `forums` table
| Field         | Type       | Notes                        |
|---------------|------------|------------------------------|
| `_id`         | `Id`       | auto                         |
| `_creationTime` | `number` | auto                       |
| `title`       | `string`   | e.g. "General Discussion"    |
| `slug`        | `string`   | e.g. "general-discussion"    |
| `description` | `string`   | e.g. "General chit‑chat about mysteries" |
| `category`    | `string`   | e.g. "Mysteries", "The Lodge" |
| `sortOrder`   | `number`   | for ordering display          |
| `icon`        | `string`   | emoji or icon name            |

### `posts` table
| Field         | Type             | Notes                        |
|---------------|------------------|------------------------------|
| `_id`         | `Id`             | auto                         |
| `_creationTime` | `number`       | auto                         |
| `authorId`    | `Id<"users">`    | FK to users                  |
| `title`       | `string`         | post title                   |
| `content`     | `string`         | plaintext body               |
| `createdAt`   | `number`         | timestamp                    |
| `updatedAt`   | `number`         | timestamp                    |
| `upvotes`     | `number`         | default 0                    |
| `downvotes`   | `number`         | default 0                    |
| `forumId`     | `Id<"forums">`   | FK to forums                 |
| `isPinned`    | `boolean`        | default false                |
| `isLocked`    | `boolean`        | default false                |

### `replies` table *(future)*
| Field         | Type             | Notes     |
|---------------|------------------|-----------|
| `postId`      | `Id<"posts">`    | FK        |
| `authorId`    | `Id<"users">`    | FK        |
| `content`     | `string`         |           |
| `createdAt`   | `number`         |           |
| `updatedAt`   | `number`         |           |

---

## 2. Convex Backend Queries & Mutations

### Queries
- **`forums.list`** — returns all forums ordered by `sortOrder`
- **`posts.list`** — takes `forumId`, returns posts ordered by `isPinned` DESC, then `createdAt` DESC
- **`posts.recent`** — returns latest 6 posts across all forums (for homepage sidebar)
- **`posts.get`** — single post by `_id`

### Mutations
- **`posts.vote`** — accepts `postId` (+1 or −1)
- **`seed.initialize`** — idempotent seed: creates 3 forums + 8–10 posts

---

## 3. Seed / Fake Data

Idempotent mutation (`convex/seed.ts`):

**Users** (5–6 seed users):
| Username         | Role        | Avatar hint              |
|------------------|-------------|--------------------------|
| `Sherlock_H0mes` | moderator   | deerstalker hat          |
| `ghost_hunter_99`| member      | torch                    |
| `Moriarty`       | member      | shadowy figure           |
| `daneel`         | admin       | robot silhouette         |
| `Willow_Smith`   | member      | magnifying glass         |
| `Lady_Eliza`     | moderator   | cameo brooch             |

**Forums:**
1. **General Discussion** — "Discuss all things mysterious…" | icon 🕵️
2. **Cold Cases** — "Unsolved mysteries from years gone by" | icon 💀
3. **The Lodge** — "Members‑only lounge (well, not really)" | icon 🔍

**Posts** (8–10 across forums):
- Varied `authorId` references to seed users
- Varied upvote/downvote counts, timestamps spanning a few weeks
- 2 pinned posts in General Discussion

---

## 4. Homepage Layout (src/routes/index.tsx)

### Visual Style — 90s/2000s Retro Forum
- **Background:** `url(/stars.png)` tiled repeat, dark navy/black base
- **Banner:** centred `<img>` from cooltext.com (the title GIF)
- **Colour palette:**
  - Background: `#0a0a2e` / `#000011`
  - Table headers: `#1a1a4e` with subtle border `#3a3a6e`
  - Table rows: alternating `#0f0f2e` / `#14143a`
  - Text: `#d4c5a9` (pale cream)
  - Links: `#d45b07` (burnt orange) → hover `#e8c547` (muted yellow)
  - Accent borders: `#8b7355` / `#6b5b45`
- **Fonts:** system serif stack for body (`Georgia, "Times New Roman", serif`), monospace for usernames
- **Borders:** 3‑pixel outset/inset style (`ridge` / `groove`) to mimic old‑school tables

### Page Sections

```
┌──────────────────────────────────────┐
│          [BANNER GIF - centred]        │
│  "Dedicated to the unsolved mysteries  │
│   of the Bodgeham‑on‑Wye area."        │
├──────────────────────────────────────┤
│  [Home] [Forums] [About]  — nav strip  │
├──────────────────────────────────────┤
│  ┌─ Forum Listing Table ────────────┐  │
│  │ Icon │ Forum │ Threads │ Last Post│  │
│  ├──────┼───────┼─────────┼─────────┤  │
│  │  🕵️  │General│   5     │ by ...   │  │
│  │  💀  │Cold...│   3     │ by ...   │  │
│  │  🔍  │Lodge  │   2     │ by ...   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌─ Recent Threads ─────────────────┐  │
│  │ Title              │ Author │ ⬆⬇  │  │
│  ├──────────────────────────────────┤  │
│  │ The Weeping Lady..│ Sherlock │12│   │
│  │ ...                │         │   │   │
│  └──────────────────────────────────┘  │
│                                         │
│  ── Footer: "Powered by Bodgeham" ──   │
└──────────────────────────────────────┘
```

### Component Tree
```
<HomePage>
  <Banner />           ← title GIF + subtitle
  <NavStrip />         ← Home | Forums | About (no real links yet)
  <ForumList />        ← table of forums w/ post counts
  <RecentThreads />    ← table of latest 6 posts
  <Footer />           ← small footer text
</HomePage>
```

---

## 5. CSS Strategy

Write retro styles in `src/styles/app.css` under the `@import "tailwindcss"` line.
- Define CSS custom properties in `:root` for the palette
- Use utility classes from Tailwind where they fit (spacing, flex), but lean on hand‑written CSS for the retro table borders, tiled background, link colours, and monospace username styling
- The `stars.png` background goes on `<body>` via `background-image: url(/stars.png)` with `background-repeat: repeat`

---

## 6. Assets

| Asset | Location | Usage |
|-------|----------|-------|
| `stars.png` | `public/stars.png` (already in assets/, copy to public/) | Tiled page background |
| Title GIF | `https://images.cooltext.com/5753289.gif` | Banner image in `<img>` tag |

---

## 7. Implementation Order

1. **Update Convex schema** — replace `tasks` table with `users` + `forums` + `posts`
2. **Run `npx convex dev`** — generate API stubs in `_generated/`
3. **Write queries** — `users.list`, `forums.list`, `posts.list`, `posts.recent`, `posts.get`
4. **Write mutations** — `posts.vote`, `users.updateReputation`
5. **Write seed mutation** — `seed.initialize` with idempotent check (users → forums → posts)
6. **Run seed** via `npx convex run seed:initialize`
7. **Copy stars.png** from `assets/` to `public/stars.png`
8. **Rewrite `src/routes/index.tsx`** — remove tasks UI, build forum homepage per `reference.png`
9. **Style retro CSS** in `app.css`
10. **Update `__root.tsx`** — set body background to stars.png, update title/description meta
11. **Run `npm run dev`** — test and iterate
12. **Commit** the result

---

## 8. Future Considerations (Post‑MVP)

- Auth + user profiles
- Post creation form
- Reply / thread view page
- BBCode or markdown rendering
- Search
- Pagination for posts
