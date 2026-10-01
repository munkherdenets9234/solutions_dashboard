'use server'

import { redirect } from 'next/navigation'
import { ApiError, apiPost } from '@/lib/api/client'

// Both routes are public on digitalservice (someone who has forgotten their
// password has no session) but tenant-scoped: apiPost carries this site's
// X-API-Key, which is what ties a reset to this tenant's users and no one
// else's. The key stays on the server; none of this reaches the browser.

export interface RequestResetState {
  error?: string
  // Set once a code has been requested. It deliberately says nothing about
  // whether the address has an account: the API answers the same either way,
  // and this page must not undo that by hinting at the difference.
  sentTo?: string
}

export interface ConfirmResetState {
  error?: string
}

// Messages the server writes are safe to show as they are; these are the cases
// the page has something more useful to say about.
function explain(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback
  switch (err.status) {
    case 503:
      return "Email isn't set up on this server, so a code can't be sent. Ask whoever runs the platform to configure it."
    case 429:
      return 'Too many attempts. Wait a minute and try again.'
    default:
      return err.message || fallback
  }
}

export async function requestResetAction(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Enter the email address of your account.' }

  try {
    await apiPost('/password-reset/request', { email })
  } catch (err) {
    return { error: explain(err, 'Something went wrong. Please try again.') }
  }
  return { sentTo: email }
}

export async function confirmResetAction(
  _prev: ConfirmResetState,
  formData: FormData
): Promise<ConfirmResetState> {
  const email = String(formData.get('email') ?? '').trim()
  const code = String(formData.get('code') ?? '').trim()
  const password = String(formData.get('new_password') ?? '')
  const confirm = String(formData.get('confirm_password') ?? '')

  // Checked here as well as on the server so the common typos do not spend one
  // of the code's five attempts: the code is burned after five wrong guesses,
  // and a mistyped confirmation is not a guess.
  if (!/^\d{6}$/.test(code)) return { error: 'Enter the 6-digit code from the email.' }
  if (password.length < 8) return { error: 'The new password must be at least 8 characters.' }
  if (password !== confirm) return { error: 'The two passwords do not match.' }

  try {
    await apiPost('/password-reset/confirm', { email, code, new_password: password })
  } catch (err) {
    return { error: explain(err, 'Something went wrong. Please try again.') }
  }

  // redirect() works by throwing, so it sits outside the try above or the catch
  // would swallow it. No session is issued by a reset, so this goes to sign-in.
  redirect('/login?reset=1')
}
