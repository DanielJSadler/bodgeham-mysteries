type SearchPanelProps = {
  title?: string
  query?: string
}

export function SearchPanel({ title = 'Looking for Answers?', query = '' }: SearchPanelProps) {
  return (
    <section className="forum-panel compact-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <form className="search-box" action="/search" method="get">
        <input aria-label="Search forum" name="q" type="search" defaultValue={query} />
        <button type="submit">Search</button>
      </form>
    </section>
  )
}
