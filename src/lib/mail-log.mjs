// Display text for the mail log. `sent` only means the mail service accepted
// the message, so it is labelled "Accepted" and never "delivered".
const STATUS = { pending: 'Pending', sent: 'Accepted', failed: 'Failed' }

const ERRORS = {
  mail_not_configured: 'Mail not configured',
  rate_limited: 'Rate limited',
  upstream: 'Mail service error',
  unreachable: 'Mail service unreachable',
  recipient_opted_out: 'Recipient unsubscribed',
}

export const MAIL_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: STATUS.pending },
  { value: 'sent', label: STATUS.sent },
  { value: 'failed', label: STATUS.failed },
]

// Unknown values are returned unchanged so a new backend value stays readable.
export function mailStatusLabel(status) {
  return Object.hasOwn(STATUS, status) ? STATUS[status] : status
}

export function mailErrorLabel(code) {
  return Object.hasOwn(ERRORS, code) ? ERRORS[code] : code
}
