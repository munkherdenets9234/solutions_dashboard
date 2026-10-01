'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import {
  confirmResetAction,
  requestResetAction,
  type ConfirmResetState,
  type RequestResetState,
} from './actions'

const requestInitial: RequestResetState = {}
const confirmInitial: ConfirmResetState = {}

const inputClass =
  'h-9 px-3 rounded-md border border-input-border bg-panel text-sm outline-none focus:border-ink'
const buttonClass = 'h-9 rounded-md bg-ink text-ink-contrast text-sm font-semibold disabled:opacity-60'
const errorClass =
  'text-xs font-medium text-status-cancelled-text bg-status-cancelled-bg rounded-md px-3 py-2'

export default function ForgotPasswordForm() {
  const [requestState, requestAction, requesting] = useActionState(requestResetAction, requestInitial)

  // "Start over" returns to step one without losing what was typed.
  const [startedOver, setStartedOver] = useState(false)
  const email = requestState.sentTo
  const onCodeStep = Boolean(email) && !startedOver

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 mb-8">
          <div className="w-9 h-9 rounded-[7px] bg-ink" />
          <div className="mt-2 font-wordmark text-2xl font-bold leading-none">E&amp;S Travel Mongolia</div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted">Admin</div>
        </div>

        <div className="bg-panel border border-hairline rounded-[10px] p-6 flex flex-col gap-4">
          <h1 className="text-base font-semibold">Reset your password</h1>

          {!onCodeStep ? (
            <form
              action={(fd) => {
                setStartedOver(false)
                requestAction(fd)
              }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-body">
                Enter the email address of your account and we will send a 6-digit code to it.
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-body">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  defaultValue={email ?? ''}
                  className={inputClass}
                />
              </div>

              {requestState.error ? <p className={errorClass}>{requestState.error}</p> : null}

              <button type="submit" disabled={requesting} className={buttonClass}>
                {requesting ? 'Sending…' : 'Send code'}
              </button>
            </form>
          ) : (
            <CodeStep email={email!} onStartOver={() => setStartedOver(true)} />
          )}

          <Link href="/login" className="text-xs font-semibold text-body hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}

// The code step is its own component so its form state belongs to ONE request
// for a code. Left in the parent, the error from a previous attempt (a different
// address, or an old code) survives "start over" and shows up on the fresh step
// as if it were about the new code.
function CodeStep({ email, onStartOver }: { email: string; onStartOver: () => void }) {
  const [state, action, pending] = useActionState(confirmResetAction, confirmInitial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Worded to be true whether or not the address has an account: the API
          answers the same either way, and this must not hint. */}
      <p className="text-sm text-body">
        If <strong>{email}</strong> belongs to an account, a code is on its way. It expires in 10 minutes and works
        once.
      </p>

      <input type="hidden" name="email" value={email} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-xs font-semibold text-body">
          Code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className={`${inputClass} tracking-[0.4em]`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new_password" className="text-xs font-semibold text-body">
          New password
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
        <span className="text-[11px] text-muted">At least 8 characters.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm_password" className="text-xs font-semibold text-body">
          Confirm new password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </div>

      {state.error ? <p className={errorClass}>{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Saving…' : 'Set new password'}
      </button>

      <button
        type="button"
        onClick={onStartOver}
        className="text-xs font-semibold text-body hover:underline self-start"
      >
        Use a different email or send a new code
      </button>
    </form>
  )
}
