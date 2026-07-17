// Shows who last created/updated a record via the admin panel. Callers pass
// the already-resolved display string (either a `lastEditedBy` field the API
// returns directly, or a tenant_users._id resolved against a name map).
// Renders nothing when absent — either never touched by an authenticated
// tenant user, or (for bookings/rentals/contact messages) still awaiting its
// first admin action.
export function LastEditedBy({ lastEditedBy }: { lastEditedBy?: string }) {
  if (!lastEditedBy) return null
  return <p className="text-[11px] text-muted mt-1">Last edited by {lastEditedBy}</p>
}
