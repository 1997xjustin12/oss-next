// Confirmed field names via REVIEWS_FLOW.md (extracted from a working
// reference implementation, 2026-07-14) — not yet verified against this
// app's own backend (its reviews table is still empty).
export interface Review {
  id: number | string
  rating: number
  title: string
  comment: string
  created_at: string
  user: { username: string; email?: string }
  product?: { id?: number | string; title: string }
}

export interface ReviewListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Review[]
  // Aggregate summary fields are INCONSISTENT across the two known consumers
  // in the reference app (top-level overall_rating/by_star vs. nested
  // summary.average_rating/total_reviews) — neither confirmed against a live
  // call. Left loose since the write/edit flow only needs `results`; verify
  // before relying on either shape for a ratings-summary display.
  overall_rating?: number
  by_star?: { name: string; star: number; votes: number }[]
  summary?: { average_rating: number; total_reviews: number }
}
