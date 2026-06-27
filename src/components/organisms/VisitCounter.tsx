import { useEffect, useState } from 'react'

import { useMutation } from 'convex/react'
import { useLocation } from '@tanstack/react-router'

import { api } from '@convex/_generated/api'

function formatVisitCount(count: number | null) {
  return String(count ?? 0).padStart(6, '0')
}

export function VisitCounter() {
  const { pathname } = useLocation()
  const touchPageVisit = useMutation(api.visits.touchPageVisit)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    void touchPageVisit({ path: pathname }).then((result) => {
      if (!cancelled) {
        setCount(result.count)
      }
    })

    return () => {
      cancelled = true
    }
  }, [pathname, touchPageVisit])

  return (
    <div className="visit-counter" aria-label={`Visited ${formatVisitCount(count)} times`}>
      <span>Visited</span>
      <strong>{formatVisitCount(count)}</strong>
    </div>
  )
}
