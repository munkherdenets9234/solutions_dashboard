// Reads the `role` claim from a JWT payload WITHOUT verifying the signature.
// Display use only (hide nav items); the backend enforces roles on every call.
export function tokenRole(token) {
  if (typeof token !== 'string') return undefined
  const part = token.split('.')[1]
  if (!part) return undefined
  try {
    const json = Buffer.from(part, 'base64url').toString('utf8')
    const role = JSON.parse(json)?.role
    return typeof role === 'string' ? role : undefined
  } catch {
    return undefined
  }
}
