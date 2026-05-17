import { useAuthActions } from '@convex-dev/auth/react'

import { AuthButton } from '../atoms/AuthButton'

type GithubLoginButtonProps = {
  onError: (message: string) => void
}

export function GithubLoginButton({ onError }: GithubLoginButtonProps) {
  const { signIn } = useAuthActions()

  return (
    <AuthButton
      type="button"
      variant="secondary"
      onClick={() => {
        void signIn('github', { redirectTo: '/' }).catch((error) => {
          onError(error instanceof Error ? error.message : 'GitHub login failed.')
        })
      }}
    >
      Login with GitHub
    </AuthButton>
  )
}
