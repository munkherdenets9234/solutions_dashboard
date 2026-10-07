// Only jpeg and png files get an inline preview; the backend refuses `inline`
// for anything else. Compares the stored mime, ignoring case and parameters.
export function isPreviewableMime(mime) {
  if (typeof mime !== 'string') return false
  const base = mime.split(';')[0].trim().toLowerCase()
  return base === 'image/jpeg' || base === 'image/png'
}
