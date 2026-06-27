import { useEffect } from 'react'

import { useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'

export function ActivityHeartbeat() {
  const touchPresence = useMutation(api.users.touchPresence)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storageKey = 'bodgeham-visitor-id'
    const visitorId =
      window.localStorage.getItem(storageKey) ??
      (() => {
        const nextId = window.crypto.randomUUID()
        window.localStorage.setItem(storageKey, nextId)
        return nextId
      })()

    const touch = () => {
      void touchPresence({
        visitorId,
      })
    }

    touch()

    const interval = window.setInterval(() => {
      touch()
    }, 30_000)

    const onFocus = () => {
      touch()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        touch()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [touchPresence])

  return null
}
