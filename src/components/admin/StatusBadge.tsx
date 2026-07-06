const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-status-confirmed-bg text-status-confirmed-text',
  completed: 'bg-status-confirmed-bg text-status-confirmed-text',
  active: 'bg-status-confirmed-bg text-status-confirmed-text',
  published: 'bg-status-confirmed-bg text-status-confirmed-text',
  admin: 'bg-status-confirmed-bg text-status-confirmed-text',
  responded: 'bg-status-success-bg text-status-success-text',
  read: 'bg-status-pending-bg text-status-pending-text',
  pending: 'bg-status-pending-bg text-status-pending-text',
  draft: 'bg-status-pending-bg text-status-pending-text',
  new: 'bg-status-pending-bg text-status-pending-text',
  staff: 'bg-status-pending-bg text-status-pending-text',
  suspended: 'bg-status-cancelled-bg text-status-cancelled-text',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled-text',
  canceled: 'bg-status-cancelled-bg text-status-cancelled-text',
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? 'bg-status-pending-bg text-status-pending-text'
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold capitalize ${style}`}>
      {status}
    </span>
  )
}
