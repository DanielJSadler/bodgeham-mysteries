import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

import { AuthButton } from '../atoms/AuthButton'
import { AuthInput } from '../atoms/AuthInput'

type PasswordResetFormProps = {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

type ResetStep = 'request' | { email: string }

export function PasswordResetForm({ onError, onSuccess }: PasswordResetFormProps) {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<ResetStep>('request')

  if (step !== 'request') {
    return (
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)

          void signIn('password', formData)
            .then(() => onSuccess('Password reset. You are now logged in.'))
            .catch((error) => {
              onError(error instanceof Error ? error.message : 'Reset verification failed.')
            })
        }}
      >
        <AuthInput label="Token" name="code" type="text" inputMode="numeric" required />
        <AuthInput label="New password" name="newPassword" type="password" required />
        <input name="email" type="hidden" value={step.email} />
        <input name="flow" type="hidden" value="reset-verification" />

        <div className="auth-actions-row">
          <AuthButton type="submit">Reset Password</AuthButton>
          <AuthButton type="button" variant="ghost" onClick={() => setStep('request')}>
            Back
          </AuthButton>
        </div>
      </form>
    )
  }

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = String(formData.get('email') ?? '')

        void signIn('password', formData)
          .then(() => {
            setStep({ email })
            onSuccess('Reset token created. Check Convex logs for the dev token.')
          })
          .catch((error) => {
            onError(error instanceof Error ? error.message : 'Could not create reset token.')
          })
      }}
    >
      <AuthInput label="Account email" name="email" type="email" required />
      <input name="flow" type="hidden" value="reset" />
      <AuthButton type="submit" variant="secondary">Send Reset Token</AuthButton>
    </form>
  )
}
