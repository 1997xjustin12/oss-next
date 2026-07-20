# Reviews — flow, forms, and object shapes from this project's implementation

Extracted from the live code paths: `src/pages/api/reviews/{list,create,update}.js`, `src/app/context/auth.js`, `src/app/components/new-design/sections/my-account/OrdersPage.jsx`, `src/app/components/molecule/ProductReviewSection.jsx`, `src/app/components/new-design/sections/Reviews.jsx`, `src/app/hooks/useReviews.js`, `src/app/lib/api.js`.

---

## 1. Your purchase-gating assumption — partially confirmed, with an important gap

You're right that **one** entry point in this app gates review-writing on a delivered order — but there's a **second** entry point that doesn't, which is worth deciding on deliberately rather than copying both.

**Entry point A — Order History (`OrdersPage.jsx`), properly gated:**
```jsx
{order?.status === "delivered" && (
  <ReviewButton product={item?.product} toggleForm={handleToggleForm} />
)}
```
The "Write Review" button only renders when the specific order's `status === "delivered"`, and it's rendered per line-item, passing that item's real `product_id` from an actual order the user placed. This is the correct, intentional gate.

**Entry point B — standalone PDP review form (`ProductReviewSection.jsx`):**
This component renders a `ReviewForm` that takes any `product` object and calls `userReviewCreate` directly — **there is no purchase or delivery check anywhere in this component.** Any logged-in user (the request just sends whatever `accessToken` exists) could submit a review for a product they never bought, purely from the client's perspective.

**What this means for you:** the client-side code in this reference app does **not** uniformly enforce "must have a delivered order for this product" — it only does so in the Order-History flow. Whether the *backend* independently rejects a create call from someone with no qualifying order is unconfirmed from the frontend alone (no error-shape handling for a "not eligible" rejection exists in either form's `catch` blocks). 

**Recommendation:** don't assume the backend enforces this for you. If purchase-gating is a hard requirement for the new app, enforce it the same way Entry Point A does — only expose the "write a review" UI from the Order History page, gated on `status === "delivered"` — and treat any PDP-level "write a review" entry point as optional/decorative unless you've confirmed the backend rejects unqualified submissions. One real test (attempt to POST a review for a product with no delivered order on that account) would settle it.

---

## 2. Duplicate/edit detection (one review per user per product)

`ReviewButton` (`OrdersPage.jsx:227-263`) fetches that product's reviews and looks for one belonging to the current user:
```js
const response = await getReviewsByProductId(product_id); // GET /api/reviews/list?product_id=...
const data = await response.json();
const found = data?.results?.find((r) => r?.user?.email === user?.email);
```
If found → renders "Edit Review" and opens the form pre-filled with `{ product: found.product?.id, rating, title, comment, id: found.id }` → calls **update**. If not found → renders "Write Review" → calls **create** with `id` omitted. This is a client-side convention (one review per user per product), not something confirmed enforced server-side — but it's the pattern to replicate for a sane UX regardless.

---

## 3. Create — `POST /api/reviews/create`

Proxy validation (`src/pages/api/reviews/create.js:8-16`) requires all four fields, 400s otherwise:
```ts
interface CreateReviewRequest {
  product: number | string; // NOTE: field is literally named "product", holding a product_id value — not "product_id"
  rating: number;           // 1–5, from the star-rating widget
  title: string;
  comment: string;
}
```
Client call (`auth.js:371-381`):
```js
fetch("/api/reviews/create", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify(data), // { product, rating, title, comment }
});
```
Proxies to `${NEXT_SOLANA_BACKEND_URL}/api/reviews/create` with `X-Store-Domain` + forwarded Bearer token. Response is re-wrapped by the proxy as `{ success: response.ok, data: <backend body> }`.

---

## 4. Update — `PUT /api/reviews/update`

Proxy validation (`src/pages/api/reviews/update.js:8-16`) requires **five** fields — same as create plus `id`:
```ts
interface UpdateReviewRequest {
  id: number | string;       // the review's own id, from a prior GET
  product: number | string;
  rating: number;
  title: string;
  comment: string;
}
```
The proxy rewrites the URL using `id` from the body: `${NEXT_SOLANA_BACKEND_URL}/api/reviews/${id}/update` (`update.js:20`) — so the review id is path-based on the backend even though the client sends it in the body to a flat `/api/reviews/update` route. Client call is otherwise identical in shape to create, just `method: "PUT"` (`auth.js:383-393`).

---

## 5. Get / list — `GET /api/reviews/list`

### Query params (confirmed, `src/pages/api/reviews/list.js:8-17`)
| Param | Required | Purpose |
|---|---|---|
| `product_id` | No | Omit to get a **site-wide** review feed (used by the homepage testimonials section); include to scope to one product |
| `page` | No, defaults to `1` | Pagination page number |

No `page_size`/`limit` param is ever sent by this client — page size is whatever the backend defaults to.

### Response shape — two different consumers expect two different shapes (flag this)

**`ProductReviewSection.jsx` (PDP reviews list)** treats the *entire* response object as both the paginated envelope and the summary:
```ts
interface ReviewListResponse {
  count: number;
  next: string | null;      // see CORS/header warning below
  previous: string | null;
  results: Review[];
  overall_rating: number;               // read directly off the top-level object
  by_star: { name: string; star: number; votes: number }[]; // top-level too
}
```

**`Reviews.jsx` (homepage testimonials, `useReviews()`, no `product_id`)** expects a **nested** `summary` object with **different field names**:
```ts
reviewDetails?.summary?.average_rating   // not "overall_rating"
reviewDetails?.summary?.total_reviews    // not derived from by_star
reviewDetails?.results
```

**These are inconsistent and both can't be right against the same backend contract.** Likely explanation: nobody has fully verified this against live data, or the shape genuinely differs between a product-scoped call and a site-wide call. Either way — **confirm the actual response shape with one real `GET /api/reviews/list` call (with and without `product_id`) before committing to a TypeScript type.** Don't port both assumptions blindly; pick one after verifying, or handle both defensively (`data.overall_rating ?? data.summary?.average_rating`).

### Review object shape (from `results[]`, confirmed fields actually read across both consumers)
```ts
interface Review {
  id: number | string;
  rating: number;            // read via parseFloat(review.rating), implying possibly numeric-string
  title: string;
  comment: string;
  created_at: string;        // ISO date, rendered via dayjs(...).fromNow()
  user: {
    username: string;
    email?: string;          // read for duplicate-review matching (review.user.email), not rendered
  };
  product?: {                // present at least on the site-wide (no product_id) feed — used for the "on {product.title}" footer
    id?: number | string;
    title: string;
  };
}
```

### ⚠️ Pagination links may bypass your proxy (CORS/header risk)
`ProductReviewSection.jsx`'s `handlePageChange` does `fetch(reviews.next)`/`fetch(reviews.previous)` directly on whatever URL the backend returned. If the Django backend generates absolute pagination URLs (standard DRF behavior, based on request host), and the proxy just passes the JSON through unmodified (`list.js:43-46` does exactly that — no rewriting of `next`/`previous`), then those links likely point **directly at `NEXT_SOLANA_BACKEND_URL`**, not back through `/api/reviews/list`. Calling that from the browser would skip your `X-Store-Domain` header and hit a different origin (CORS risk, and the backend may reject requests missing the store-domain header). **Don't port this pagination pattern as-is** — reconstruct the next/prev page yourself by incrementing `page` and re-calling your own `/api/reviews/list?...&page=N`, rather than trusting the raw URL the backend returns.

---

## 6. Forms (two implementations, same field set)

Both `OrdersPage.jsx`'s modal `ReviewForm` and `ProductReviewSection.jsx`'s inline `ReviewForm` collect the identical three user-facing fields:

| Field | Input | Notes |
|---|---|---|
| `rating` | `@smastrom/react-rating` star widget, 1–5 | Defaults to a pre-filled placeholder value (3 or 4) in both — you'll want a real empty/required state instead |
| `title` | text input, required | Single line |
| `comment` | textarea, required | Multi-line |

`product` (the id) and `id` (only on edit) are set programmatically from context — never user-entered fields. On edit, the form is pre-populated from the matched review found via the duplicate-check in §2.

Submission handling in both forms is minimal — check `response.ok`, log a warning on failure, no user-facing error message shown on failure in either implementation (worth improving in the new app rather than copying as-is).

---

## 7. Suggested TypeScript types

```ts
interface Review {
  id: number | string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user: { username: string; email?: string };
  product?: { id?: number | string; title: string };
}

interface ReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
  // CONFIRM actual field names before use — two inconsistent shapes seen in this codebase:
  overall_rating?: number;
  by_star?: { name: string; star: number; votes: number }[];
  summary?: { average_rating: number; total_reviews: number };
}

interface CreateReviewRequest {
  product: number | string;
  rating: number;
  title: string;
  comment: string;
}

interface UpdateReviewRequest extends CreateReviewRequest {
  id: number | string;
}
```

---

## Bottom line

- **Purchase-gating**: real in one flow (Order History → `status === "delivered"` → review button), absent in another (standalone PDP form). Build the new app with only the gated entry point unless you confirm the backend also enforces it independently.
- **Create**: `{ product, rating, title, comment }` — note the field is `product`, not `product_id`.
- **Update**: same four fields plus `id`.
- **Get**: `product_id` (optional, omit for site-wide feed) + `page` (default 1); DRF-style `count/next/previous/results`, but the rating-summary field names are **inconsistent between two components in this codebase** — verify with a live call before typing it.
- **Don't** follow the `next`/`previous` URLs from the raw response directly — they likely bypass your API proxy and its required headers.
