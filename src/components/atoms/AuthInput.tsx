import type { InputHTMLAttributes } from 'react'

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function AuthInput({ label, id, ...props }: AuthInputProps) {
  const inputId = id ?? props.name

  return (
    <label className="auth-field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
    </label>
  )
}
