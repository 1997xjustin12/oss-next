const BAR = 'rounded bg-theme-border dark:bg-gray-700'

/** One card laid out like OrderCard, so the order lands without a shift. */
export function OrderStatusSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-hidden="true">
      {[0].map((i) => (
        <div
          key={`order-status-skeleton-${i}`}
          className="rounded-lg border border-theme-border bg-theme-subtle dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-start justify-between gap-3 border-b border-theme-border p-4 sm:p-5 dark:border-gray-700">
            <div>
              <div className={`h-3 w-12 mb-2 ${BAR}`} />
              <div className={`h-4 w-32 mb-1.5 ${BAR}`} />
              <div className={`h-3 w-24 ${BAR}`} />
            </div>
            <div className="h-6 w-20 rounded-full bg-theme-border dark:bg-gray-700" />
          </div>
          <div className="flex flex-col gap-5 p-4 sm:p-5">
            <div className={`h-4 w-2/3 ${BAR}`} />
            <div className={`h-11 w-full ${BAR}`} />
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 rounded-md bg-theme-border dark:bg-gray-700" />
              <div className="flex-1">
                <div className={`h-4 w-1/2 mb-2 ${BAR}`} />
                <div className={`h-3 w-24 ${BAR}`} />
              </div>
            </div>
            <div className="grid gap-5 border-t border-theme-border pt-5 sm:grid-cols-2 dark:border-gray-700">
              <div className={`h-12 ${BAR}`} />
              <div className={`h-24 ${BAR}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
