import type { ButtonHTMLAttributes, ReactNode } from 'react'

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function AuthButton({ children, className = '', variant = 'primary', ...props }: AuthButtonProps) {
  return (
    <button className={`auth-button auth-button-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
