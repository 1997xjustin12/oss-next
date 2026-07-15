export function ResetPasswordFormSkeleton() {
  return (
    <div className="max-w-xl animate-pulse">
      <div className="h-4 w-56 rounded bg-theme-subtle mb-6 dark:bg-gray-800" />
      <div className="space-y-5">
        <div>
          <div className="h-3.5 w-28 rounded bg-theme-subtle mb-1.5 dark:bg-gray-800" />
          <div className="h-[42px] w-full rounded-md bg-theme-subtle dark:bg-gray-800" />
        </div>
        <div>
          <div className="h-3.5 w-40 rounded bg-theme-subtle mb-1.5 dark:bg-gray-800" />
          <div className="h-[42px] w-full rounded-md bg-theme-subtle dark:bg-gray-800" />
        </div>
        <div className="h-[42px] w-24 rounded-md bg-theme-subtle dark:bg-gray-800" />
      </div>
    </div>
  )
}
