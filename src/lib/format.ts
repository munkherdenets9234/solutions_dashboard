// The API never exposes a customer's name/email on bookings, rentals, or
// transfers — only a customer_id — and there is no customers endpoint to
// resolve it. Render a short, readable reference instead of the raw ObjectId.
export function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`
}
