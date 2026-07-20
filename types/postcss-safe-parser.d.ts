// postcss-safe-parser ships no type declarations of its own (checked at v7.0.1).
// It is a postcss Parser: same call shape as postcss.parse, but it recovers from
// syntax errors instead of throwing — see scopeCss() in services/wp-pages.service.ts.
declare module 'postcss-safe-parser' {
  import type { Root, ProcessOptions } from 'postcss'

  const safeParser: (
    css: string | { toString(): string },
    options?: Pick<ProcessOptions, 'from' | 'map'>,
  ) => Root

  export default safeParser
}
