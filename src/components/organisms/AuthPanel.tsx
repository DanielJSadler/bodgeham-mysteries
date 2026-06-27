import { useState } from 'react'
import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { AuthButton } from '../atoms/AuthButton'
import { AuthNotice } from '../atoms/AuthNotice'
import { GithubLoginButton } from '../molecules/GithubLoginButton'
import { PasswordAuthForm } from '../molecules/PasswordAuthForm'
import { PasswordResetForm } from '../molecules/PasswordResetForm'

type AuthMode = 'login' | 'reset'

type AuthPanelProps = {
  title?: string
}

export function AuthPanel({ title = 'Member Access' }: AuthPanelProps) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signOut } = useAuthActions()
  const { data: currentUser } = useQuery(
    convexQuery(api.users.current, isAuthenticated ? {} : 'skip'),
  )
  const [mode, setMode] = useState<AuthMode>('login')
  const [notice, setNotice] = useState<{
    tone: 'error' | 'info' | 'success'
    message: string
  } | null>(null)

  if (isLoading || (isAuthenticated && currentUser === undefined)) {
    return (
      <section className="forum-panel compact-panel auth-panel">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        <p>Checking session...</p>
      </section>
    )
  }

  if (isAuthenticated) {
    const username =
      currentUser?.username ??
      currentUser?.displayName ??
      currentUser?.name ??
      currentUser?.email ??
      "Logged in member";
    const role = currentUser?.role ?? "member";
    const reputation = currentUser?.reputation ?? 0;
    const email = currentUser?.email ?? "";

    return (
      <section className="forum-panel compact-panel auth-panel">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        <div className="auth-member-card">
          <p>Username</p>
          <strong className="username">{username}</strong>
          {email ? <small>{email}</small> : null}
          <small>
            {role} / rep {reputation}
          </small>
          <AuthButton
            type="button"
            variant="secondary"
            onClick={() => void signOut()}
          >
            Log Out
          </AuthButton>
        </div>
      </section>
    )
  }

  return (
    <section className="forum-panel compact-panel auth-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <div className="auth-panel-body">
        {notice ? (
          <AuthNotice tone={notice.tone}>{notice.message}</AuthNotice>
        ) : null}
        {mode === 'login' ? (
          <>
            <GithubLoginButton
              onError={(message) => setNotice({ tone: 'error', message })}
            />
            <div className="auth-divider">or email/password</div>
            <PasswordAuthForm
              onError={(message) => setNotice({ tone: 'error', message })}
            />
            <AuthButton
              type="button"
              variant="ghost"
              onClick={() => setMode("reset")}
            >
              Lost password?
            </AuthButton>
          </>
        ) : (
          <>
            <PasswordResetForm
              onError={(message) => setNotice({ tone: 'error', message })}
              onSuccess={(message) => setNotice({ tone: 'success', message })}
            />
            <AuthButton
              type="button"
              variant="ghost"
              onClick={() => setMode("login")}
            >
              Back to login
            </AuthButton>
          </>
        )}
      </div>
    </section>
  )
}
