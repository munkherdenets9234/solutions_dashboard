// The API never exposes a customer's name/email on bookings, rentals, or
// transfers — only a customer_id. Render a short, readable reference instead
// of the raw ObjectId (use the /admin/customers endpoints if the actual name
// is needed).
export function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`
}
