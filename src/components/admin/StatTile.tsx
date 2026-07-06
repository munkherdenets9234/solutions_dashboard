export function StatTile({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
}) {
  const trendStyle =
    trend?.direction === 'up'
      ? 'bg-status-success-bg text-status-success-text'
      : trend?.direction === 'down'
        ? 'bg-status-cancelled-bg text-status-cancelled-text'
        : 'bg-status-pending-bg text-status-pending-text'

  const trendGlyph = trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '—'

  return (
    <div className="border border-hairline rounded-[10px] bg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-body">{label}</span>
        <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-input-border" />
      </div>
      <div className="text-[26px] font-extrabold mt-2.5 tracking-tight">{value}</div>
      {trend ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[11px] font-semibold rounded-full px-1.5 py-px ${trendStyle}`}>
            {trendGlyph} {trend.label}
          </span>
        </div>
      ) : null}
    </div>
  )
}
