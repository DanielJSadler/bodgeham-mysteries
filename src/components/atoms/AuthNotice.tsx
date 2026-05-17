type AuthNoticeProps = {
  children: string
  tone?: 'error' | 'info' | 'success'
}

export function AuthNotice({ children, tone = 'info' }: AuthNoticeProps) {
  return <p className={`auth-notice auth-notice-${tone}`}>{children}</p>
}
