export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 mb-6 animate-pulse">
      <div className="h-10 rounded-lg bg-gray-100" />
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-theme-border bg-white p-4 sm:p-5">
          <div className="flex gap-4">
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200" />
            <div className="flex-1 flex flex-col gap-2.5 py-1">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
              <div className="flex gap-2 mt-1">
                <div className="h-6 w-16 rounded bg-gray-200" />
                <div className="h-6 w-16 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-6 w-16 rounded bg-gray-200" />
              <div className="h-3 w-12 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
      <div className="h-14 rounded-lg bg-gray-100" />
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-theme-border bg-white p-5 sm:p-6 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-gray-200 mb-5" />
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex justify-between gap-4">
          <div className="h-3.5 rounded bg-gray-200 flex-1" />
          <div className="h-3.5 w-16 rounded bg-gray-200" />
        </div>
        <div className="flex justify-between gap-4">
          <div className="h-3.5 rounded bg-gray-200 flex-1" />
          <div className="h-3.5 w-16 rounded bg-gray-200" />
        </div>
        <div className="flex justify-between gap-4">
          <div className="h-3.5 rounded bg-gray-200 w-3/5" />
          <div className="h-3.5 w-20 rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-px bg-gray-200 mb-4" />
      <div className="flex justify-between items-center mb-5">
        <div className="h-5 w-16 rounded bg-gray-200" />
        <div className="h-7 w-24 rounded bg-gray-200" />
      </div>
      <div className="h-12 rounded-md bg-gray-200" />
    </div>
  )
}
