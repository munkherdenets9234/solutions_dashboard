'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions'

const initialState: LoginState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 mb-8">
          <div className="w-9 h-9 rounded-[7px] bg-ink" />
          <div className="mt-2 font-wordmark text-2xl font-bold leading-none">E&S Travel Mongolia</div>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted">Admin</div>
        </div>

        <form action={formAction} className="bg-panel border border-hairline rounded-[10px] p-6 flex flex-col gap-4">
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
              className="h-9 px-3 rounded-md border border-input-border bg-panel text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-body">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-9 px-3 rounded-md border border-input-border bg-panel text-sm outline-none focus:border-ink"
            />
          </div>

          {state.error ? (
            <p className="text-xs font-medium text-status-cancelled-text bg-status-cancelled-bg rounded-md px-3 py-2">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md bg-ink text-ink-contrast text-sm font-semibold disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
