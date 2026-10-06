// Opens a signed URL in a new tab. `noopener` must NOT be in the window.open
// features string: per the HTML spec it makes window.open return null even on
// success, which would be indistinguishable from a blocked pop-up. Instead the
// opener link is severed right after opening (equivalent protection).
// Returns 'blocked' when the browser refused the tab, otherwise 'opened'.
export function openSignedLink(url, openFn) {
  const w = openFn(url, '_blank')
  if (!w) return 'blocked'
  try {
    w.opener = null
  } catch {
    // The tab is already open; nothing useful to report.
  }
  return 'opened'
}
