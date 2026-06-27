type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  label: string
}

export function Pagination({ page, pageCount, onPageChange, label }: PaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <span>
        Page {page} of {pageCount}
      </span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
        Next
      </button>
    </nav>
  )
}
