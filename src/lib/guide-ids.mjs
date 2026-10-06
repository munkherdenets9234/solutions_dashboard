// Backend ids are 24-char lowercase hex ObjectIds. Anything else must never be
// interpolated into an API path (dot-segments, separators, encoded tricks).
const OBJECT_ID = /^[0-9a-f]{24}$/

export function isGuideId(value) {
  return typeof value === 'string' && OBJECT_ID.test(value)
}

// Returns the id unchanged, or throws a generic error.
export function assertGuideId(value) {
  if (!isGuideId(value)) throw new Error('Invalid identifier')
  return value
}

// "GA-" + last 6 chars of the id, uppercased (same as the backend's confirmation id).
export function guideConfirmationId(id) {
  return `GA-${String(id).slice(-6).toUpperCase()}`
}
