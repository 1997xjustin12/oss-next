import { WpBlogListPage, wpBlogListMetadata } from './_components/WpBlogListPage'

/**
 * WordPress's blog listing, page 1. Native since 2026-11-16 so it can share
 * its post grid and pager with pages 2 … N ([page]/page.tsx); the page around
 * them is still the converted WordPress page.
 */
export function generateMetadata() {
  return wpBlogListMetadata(1)
}

export default function Page() {
  return <WpBlogListPage page={1} />
}
