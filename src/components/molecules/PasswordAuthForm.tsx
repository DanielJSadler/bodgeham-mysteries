import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

import { AuthButton } from '../atoms/AuthButton'
import { AuthInput } from '../atoms/AuthInput'

type PasswordAuthFormProps = {
  onError: (message: string) => void
}

export function PasswordAuthForm({ onError }: PasswordAuthFormProps) {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        void signIn('password', formData).catch((error) => {
          onError(error instanceof Error ? error.message : 'Password login failed.')
        })
      }}
    >
      {flow === 'signUp' ? <AuthInput label="Username" name="username" type="text" required /> : null}
      <AuthInput label="Email" name="email" type="email" required />
      <AuthInput label="Password" name="password" type="password" required />
      <input name="flow" type="hidden" value={flow} />

      <div className="auth-actions-row">
        <AuthButton type="submit">{flow === 'signIn' ? 'Login' : 'Create Account'}</AuthButton>
        <AuthButton
          type="button"
          variant="ghost"
          onClick={() => {
            setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
          }}
        >
          {flow === 'signIn' ? 'Create account' : 'Use login'}
        </AuthButton>
      </div>
    </form>
  )
}
