// Mirrors ProductVariantShell's real layout (breadcrumb, then a
// gallery+quick-specs column alongside an info-panel column) so the first
// paint doesn't jump around once the real product loads.
export function PdpSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 sm:px-[5%] py-3 border-b border-theme-border">
        <div className="h-3 w-10 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-10 px-4 sm:px-[5%] py-8 sm:py-10">
        {/* Gallery + quick specs */}
        <div className="w-full">
          <div className="aspect-[4/3] w-full rounded-lg bg-gray-200" />
          <div className="grid grid-cols-3 gap-3 mt-5 rounded-lg bg-gray-300 p-4 sm:p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-5 w-10 rounded bg-gray-400" />
                <div className="h-2 w-14 rounded bg-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-7 w-4/5 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-9 w-40 rounded bg-gray-300" />
          <div className="flex flex-col gap-2 mt-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-5/6 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="h-24 w-full rounded-lg bg-gray-200 mt-2" />
          <div className="h-14 w-full rounded-md bg-gray-300 mt-4" />
          <div className="h-12 w-full rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
