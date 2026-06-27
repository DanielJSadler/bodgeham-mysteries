export type VoteValue = 1 | -1

export type VoteTransition = {
  changed: boolean
  upvotesDelta: number
  downvotesDelta: number
  reputationDelta: number
  nextVote: VoteValue | null
}

export function latestByKey<T extends { updatedAt: number }>(items: T[], getKey: (item: T) => string) {
  const latest = new Map<string, T>()

  for (const item of items) {
    const key = getKey(item)
    const current = latest.get(key)

    if (!current || item.updatedAt >= current.updatedAt) {
      latest.set(key, item)
    }
  }

  return latest
}

export function getVoteTransition(current: VoteValue | null, next: VoteValue): VoteTransition {
  if (current === next) {
    return { changed: true, upvotesDelta: -1, downvotesDelta: 0, reputationDelta: -1, nextVote: null }
  }

  if (current === null) {
    return {
      changed: true,
      upvotesDelta: next === 1 ? 1 : 0,
      downvotesDelta: next === -1 ? 1 : 0,
      reputationDelta: next,
      nextVote: next,
    }
  }

  if (current === 1 && next === -1) {
    return { changed: true, upvotesDelta: -1, downvotesDelta: 0, reputationDelta: -1, nextVote: null }
  }

  return { changed: true, upvotesDelta: 0, downvotesDelta: -1, reputationDelta: 1, nextVote: null }
}
