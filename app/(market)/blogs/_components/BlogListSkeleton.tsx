// Dimension-matched skeleton for the card grid — mirrors BlogCard's aspect and
// spacing so the Suspense swap doesn't shift layout.
export function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="aspect-[16/9] animate-pulse bg-theme-subtle dark:bg-neutral-800" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
            <div className="h-5 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  )
}
