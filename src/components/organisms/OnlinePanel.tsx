type OnlinePanelProps = {
  title?: string
  users?: string[]
}

export function OnlinePanel({
  title = 'Who is Online',
  users = ['237 Users', '11 Members', '2 Admins'],
}: OnlinePanelProps) {
  return (
    <section className="forum-panel compact-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      {users.map((userLine) => (
        <p key={userLine}>{userLine}</p>
      ))}
    </section>
  )
}
