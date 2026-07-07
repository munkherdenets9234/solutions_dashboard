export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="border border-hairline rounded-[10px] bg-status-cancelled-bg p-5 flex flex-col gap-1">
      <div className="font-bold text-[15px] text-status-cancelled-text">Couldn&apos;t load this page</div>
      <p className="text-[13px] text-status-cancelled-text">{message}</p>
    </div>
  )
}
