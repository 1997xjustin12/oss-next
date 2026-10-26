/**
 * An InstantSearch search client backed by POST /api/search (Elasticsearch,
 * Algolia-shaped responses).
 *
 * `extraParams` adds this page's own parameters to every request (the product
 * type, the sort for the requested index name, …), which the route reads
 * alongside the standard ones (query, page, facets, facetFilters,
 * numericFilters).
 *
 * Retries once before giving up: a dropped connection or a cold function is
 * invisible that way. It never rejects: a failure returns empty results and
 * calls `onError(true)`, so the page shows a notice instead of an error
 * boundary. Same contract as the listing page's client.
 */
import type { SearchClient } from 'instantsearch.js'

type SearchRequest = { indexName: string; params?: Record<string, unknown> }

type Options = {
  extraParams: (request: SearchRequest) => Record<string, unknown>
  onError: (failed: boolean) => void
}

function emptyResults(requests: SearchRequest[]) {
  return {
    results: requests.map((r) => ({
      hits: [],
      nbHits: 0,
      page: Number(r.params?.page ?? 0),
      nbPages: 0,
      hitsPerPage: Number(r.params?.hitsPerPage ?? 20),
      processingTimeMS: 0,
      query: String(r.params?.query ?? ''),
      params: '',
      index: r.indexName,
      facets: {},
    })),
  }
}

export function createSearchClient({ extraParams, onError }: Options): SearchClient {
  const client = {
    async search(requests: SearchRequest[]) {
      const enriched = requests.map((r) => ({ ...r, params: { ...(r.params ?? {}), ...extraParams(r) } }))
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests: enriched }),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as { results?: unknown[] }
          if (!Array.isArray(data.results) || data.results.length < requests.length) {
            throw new Error('malformed search response')
          }
          onError(false)
          return data
        } catch (err) {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 400))
            continue
          }
          console.error('[search] failed after retry:', err)
          onError(true)
        }
      }
      return emptyResults(requests)
    },
  }
  // One cast, here: the responses are Algolia-shaped but not built from
  // Algolia's generated types (same as the listing page's client).
  return client as unknown as SearchClient
}
