// The API never exposes a customer's name/email on bookings, rentals, or
// transfers — only a customer_id. Render a short, readable reference instead
// of the raw ObjectId (use the /admin/customers endpoints if the actual name
// is needed).
export function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`
}

// Asia/Ulaanbaatar calendar date; '—' when the input is not a valid date.
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { timeZone: 'Asia/Ulaanbaatar' })
}

// Asia/Ulaanbaatar date and time; '—' when the input is not a valid date.
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-US', { timeZone: 'Asia/Ulaanbaatar', dateStyle: 'medium', timeStyle: 'short' })
}
