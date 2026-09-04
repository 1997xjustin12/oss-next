/**
 * Placeholders for the two parts of this flow that cannot be prerendered.
 *
 * The form reads a cookie and the summary reads the query string, so both are
 * request-time data and stream in behind Suspense. Heights here are matched to
 * the real thing so the page does not jump when they land — a form that shifts
 * under a cursor mid-click is worse than one that took another beat to arrive.
 */

const BLOCK = 'animate-pulse rounded bg-theme-border/70 dark:bg-neutral-800'

export function QuoteFormSkeleton() {
  return (
    <div
      className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-7 dark:border-neutral-800 dark:bg-neutral-900"
      aria-hidden
    >
      <div className={`${BLOCK} h-4 w-24`} />
      <div className={`${BLOCK} mt-2 h-7 w-64 max-w-full`} />
      <div className={`${BLOCK} mt-2 h-3 w-72 max-w-full`} />

      <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${BLOCK} h-12 w-full`} />
        ))}
      </div>

      <div className={`${BLOCK} mt-6 h-4 w-48`} />
      <div className="mt-2.5 grid max-w-md grid-cols-2 gap-3">
        <div className={`${BLOCK} h-11 w-full`} />
        <div className={`${BLOCK} h-11 w-full`} />
      </div>

      <div className={`${BLOCK} mt-6 h-4 w-56`} />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${BLOCK} h-5 w-32`} />
        ))}
      </div>

      <div className={`${BLOCK} mt-6 h-4 w-64 max-w-full`} />
      <div className={`${BLOCK} mt-2.5 h-12 w-full max-w-md`} />

      <div className={`${BLOCK} mt-6 h-4 w-40`} />
      <div className={`${BLOCK} mt-2.5 h-20 w-full max-w-xl`} />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className={`${BLOCK} h-12 w-full sm:w-28`} />
        <div className={`${BLOCK} h-12 w-full sm:w-[260px]`} />
      </div>
    </div>
  )
}

export function QuoteSummarySkeleton() {
  return (
    <div aria-hidden className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${BLOCK} h-5 w-44`} />
        <div className="mt-4 flex items-start gap-4">
          <div className={`${BLOCK} h-16 w-20 shrink-0`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`${BLOCK} h-4 w-full`} />
            <div className={`${BLOCK} h-4 w-2/3`} />
          </div>
        </div>
        <div className="mt-5 space-y-2 border-t border-theme-border pt-4 dark:border-neutral-800">
          <div className={`${BLOCK} h-4 w-full`} />
          <div className={`${BLOCK} h-4 w-full`} />
        </div>
        <div className={`${BLOCK} mt-5 h-24 w-full`} />
      </div>
    </div>
  )
}

export function QuoteReviewSkeleton() {
  return (
    <div
      aria-hidden
      className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className={`${BLOCK} h-3 w-20`} />
      <div className={`${BLOCK} mt-2 h-8 w-52`} />
      <div className={`${BLOCK} mt-3 h-4 w-full max-w-xl`} />
      <div className={`${BLOCK} mt-5 h-44 w-full`} />
      <div className={`${BLOCK} mt-3 h-3 w-80 max-w-full`} />
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
        <div className={`${BLOCK} h-11 flex-1`} />
        <div className={`${BLOCK} h-11 flex-1`} />
      </div>
    </div>
  )
}
