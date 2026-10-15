/** Two cards the size of GuestOrderCard, so the list lands without a shift. */
export function GuestOrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
      {[0, 1].map((i) => (
        <div
          key={`guest-order-skeleton-${i}`}
          className="rounded-lg border border-theme-border bg-theme-subtle p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="h-3 w-12 rounded bg-theme-border dark:bg-gray-700 mb-2" />
              <div className="h-4 w-32 rounded bg-theme-border dark:bg-gray-700 mb-1.5" />
              <div className="h-3 w-24 rounded bg-theme-border dark:bg-gray-700" />
            </div>
            <div className="h-6 w-20 rounded-full bg-theme-border dark:bg-gray-700" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-theme-border pt-4 dark:border-gray-700">
            <div className="h-10 rounded bg-theme-border dark:bg-gray-700" />
            <div className="h-10 rounded bg-theme-border dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  )
}
