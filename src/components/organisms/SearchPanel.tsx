type SearchPanelProps = {
  title?: string
}

export function SearchPanel({ title = 'Looking for Answers?' }: SearchPanelProps) {
  return (
    <section className="forum-panel compact-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <form className="search-box">
        <input aria-label="Search forum" type="search" />
        <button type="button">Search</button>
      </form>
      <p className="pager">&lt;&lt; - 1 . -- &gt;&gt;</p>
    </section>
  )
}
