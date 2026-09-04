/**
 * The shape Next hands a page for its query string, plus the one helper needed
 * to read it.
 *
 * Shared so the page and the components it streams agree: the promise is passed
 * down rather than awaited in the page body, because awaiting it there would
 * make the whole route request-time and undo the point of the Suspense
 * boundaries.
 */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** A repeated param (`?zip=1&zip=2`) is a mistake, not a list. Take the first. */
export function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
