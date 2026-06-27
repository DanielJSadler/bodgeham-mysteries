import { api } from '../../../convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'

type OnlinePanelProps = {
  title?: string
}

export function OnlinePanel({
  title = 'Who is Online',
}: OnlinePanelProps) {
  const { data: onlineCount } = useSuspenseQuery(convexQuery(api.users.onlineCount, {}))

  return (
    <section className="forum-panel compact-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <p>{onlineCount} users online</p>
    </section>
  )
}
