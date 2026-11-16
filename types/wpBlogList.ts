/** One post as WordPress's blog listing (/shipping-containers-blogs) showed it. */
export type WpBlogListPost = {
  /** WordPress post id; also its `post-<id>` card class. */
  wpId: number
  /** Path on this site: the converted post, or /blogs/<slug> for a native one. */
  path: string
  title: string
  excerpt: string
  /** Publish date, YYYY-MM-DD. */
  date: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
}
