export const MAIL_STATUS_FILTERS: ReadonlyArray<{ value: '' | 'pending' | 'sent' | 'failed'; label: string }>
export function mailStatusLabel(status: string): string
export function mailErrorLabel(code: string): string
