import type { ForumSortMode, ForumSortOption } from '../../lib/forum'

type SortSelectProps = {
  label: string
  value: ForumSortMode
  options: ForumSortOption[]
  onChange: (value: ForumSortMode) => void
}

export function SortSelect({ label, value, options, onChange }: SortSelectProps) {
  return (
    <label className="sort-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as ForumSortMode)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
