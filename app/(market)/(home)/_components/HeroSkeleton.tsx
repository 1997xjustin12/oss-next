// Matches Hero.tsx's outer <section> height (min-h-120 sm:min-h-150) across
// all 3 variants, so the A/B-variant Suspense boundary below doesn't shift
// layout once the real (variant-dependent) Hero resolves.
export function HeroSkeleton() {
  return (
    <section className="relative flex flex-col lg:flex-row min-h-120 sm:min-h-150 bg-theme-subtle animate-pulse">
      <div className="w-full lg:w-[60%] min-h-120 sm:min-h-150 bg-gray-200" />
      <div className="w-full lg:w-[40%] min-h-150 bg-gray-300" />
    </section>
  )
}
