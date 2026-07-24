// Stable, locale-fixed date formatting for blog dates so the server render and
// any hydration agree. WP `date` is an ISO datetime string.
export function formatBlogDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
