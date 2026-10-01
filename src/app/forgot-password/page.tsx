import ForgotPasswordForm from './ForgotPasswordForm'

// Public, like /login: it has to be reachable by someone who cannot sign in.
// src/proxy.ts exempts it from the session check; without that exemption this
// page would bounce straight back to the login screen.
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
