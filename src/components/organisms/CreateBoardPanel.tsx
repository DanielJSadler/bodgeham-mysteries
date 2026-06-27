import type { FormEvent } from 'react'

type CreateBoardPanelProps = {
  isAuthenticated: boolean
  error: string | null
  onCreateBoard: (args: {
    title: string
    description: string
    iconFile: File | null
    form: HTMLFormElement
  }) => Promise<void>
}

export function CreateBoardPanel({ isAuthenticated, error, onCreateBoard }: CreateBoardPanelProps) {
  return (
    <section className="forum-panel compact-panel">
      <div className="panel-heading">
        <h2>Create Board</h2>
      </div>
      {error ? <p className="thread-empty">{error}</p> : null}
      {!isAuthenticated ? <p className="thread-empty">Sign in to create a board.</p> : null}
      <form
        className="compose-form"
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()

          const form = event.currentTarget
          const formData = new FormData(form)
          const title = String(formData.get('title') ?? '').trim()
          const description = String(formData.get('description') ?? '').trim()
          const icon = formData.get('icon')
          const iconFile = icon instanceof File && icon.size > 0 ? icon : null

          await onCreateBoard({ title, description, iconFile, form })
        }}
      >
        <label className="compose-field">
          <span>Board title</span>
          <input name="title" type="text" maxLength={80} required disabled={!isAuthenticated} />
        </label>
        <label className="compose-field">
          <span>Description</span>
          <textarea name="description" rows={4} required disabled={!isAuthenticated} />
        </label>
        <label className="compose-field">
          <span>Icon image</span>
          <input name="icon" type="file" accept="image/*" disabled={!isAuthenticated} />
        </label>
        <div className="compose-actions">
          <button className="thread-compose-submit" type="submit" disabled={!isAuthenticated}>
            Create board
          </button>
        </div>
      </form>
    </section>
  )
}
