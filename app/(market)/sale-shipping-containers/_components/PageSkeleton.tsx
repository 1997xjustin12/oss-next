export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-theme-subtle animate-pulse">
      {/* Breadcrumb */}
      <div className="px-[5%] pt-4 pb-1">
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>

      {/* Location header */}
      <div className="px-[5%] py-4 flex flex-col gap-2">
        <div className="h-6 w-64 rounded bg-gray-200" />
        <div className="h-9 w-48 rounded bg-gray-300" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-[5%] pb-16">
        {/* Sidebar */}
        <aside className="order-2 lg:order-1 flex flex-col gap-4">
          <div className="h-32 rounded-lg bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-200" />
        </aside>

        {/* Main */}
        <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4">
          {/* Sort bar */}
          <div className="h-12 rounded-lg bg-gray-200" />
          {/* Product cards */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-theme-border bg-white p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4"
            >
              <div className="sm:col-span-3 aspect-[4/3] rounded-md bg-gray-200" />
              <div className="sm:col-span-6 flex flex-col gap-2.5 py-1">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
              <div className="sm:col-span-3 flex flex-col items-end gap-3 py-1">
                <div className="h-8 w-24 rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
