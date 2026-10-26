/** Placeholder with the results' layout, so nothing shifts when they stream in. */
export function ResultsSkeleton() {
  return (
    <div aria-hidden className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      <div className="mb-6 h-11 animate-pulse rounded-lg bg-white lg:hidden dark:bg-neutral-900" />
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="h-7 animate-pulse rounded bg-white dark:bg-neutral-900" />
        ))}
      </div>
      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="h-11 w-full animate-pulse rounded-md bg-white sm:max-w-sm dark:bg-neutral-900" />
          <div className="h-11 w-56 animate-pulse rounded-md bg-white dark:bg-neutral-900" />
        </div>
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-white dark:bg-neutral-900" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[20rem] animate-pulse rounded-lg bg-white dark:bg-neutral-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
