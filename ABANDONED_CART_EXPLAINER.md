# Abandoned Cart — How It Works

Full trace of the abandoned-cart feature in this project, for porting to a new app with the same backend. All logic lives client-side in `src/app/context/cart.js` — there's no server cron/timer; the browser watches its own activity and cart age.

---

## 1. Required environment variables

| Var | Purpose |
|---|---|
| `NEXT_UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `NEXT_UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST auth token |
| `NEXT_SOLANA_BACKEND_URL` | Django backend base URL (receives the abandoned-cart notification) |
| `NEXT_PUBLIC_STORE_DOMAIN` | Sent as `X-Store-Domain` header on the backend notify call |

**Do not paste the actual values of `NEXT_UPSTASH_REDIS_REST_URL`/`_TOKEN` into this file or any other committed doc.** This file lives in a git-tracked `docs/` folder — anything written here becomes permanent git history, readable by anyone with repo access (or the whole internet if the repo is ever public). Copy the real values directly from this project's `.env.local` into the new app's `.env.local` (or via a password manager/secrets vault) — never through a shared markdown file.

---

## 2. The Redis key for this feature

```
Key:   abandoned:{cart_id}
Value: ISO timestamp string (e.g. "2026-07-14T09:32:11.000Z"), or null
TTL:   none — plain SET with no expiry, persists until overwritten/deleted
```

Written via a generic KV proxy, not a dedicated abandoned-cart store — `abandoned:*` is just one key namespace among several (favicon/logo overrides, popular-search counters use their own prefixes). No other cart data (items, totals, addresses) is stored in Redis — only this one flag, keyed by `cart_id`.

Client helpers (`src/app/lib/api.js`):
```js
redisSet({ key, value })  // → POST /api/redis  { key, value }
redisGet(key)             // → GET  /api/redis?key=...
```

Server proxy (`src/pages/api/redis.js`) — generic GET/POST/PUT/DELETE over `@upstash/redis`:
```js
// POST
await redis.set(key, JSON.stringify(value));
// GET
await redis.get(key);   // or redis.mget([...]) if key is comma-separated
```

---

## 3. Detecting abandonment (the trigger)

A `useEffect` in `CartProvider` (`cart.js:688-719`) wires up listeners whenever a cart + user exist:

| Signal | Listener | Trigger passed |
|---|---|---|
| User activity pauses | `click`/`keydown`/`scroll`, debounced 2s | `"timed"` |
| Tab hidden or closing | `visibilitychange` → `"hidden"`, and `beforeunload` | `"beacon"` |
| Explicit logout | called directly from logout handlers | `"forced"` |

`beaconSent` is a ref that fires at most once per hide cycle, resetting when the tab becomes visible again.

All three call `createAbandonedCart(cart, user, trigger)` (`cart.js:378-440`). Inside, the actual "is this abandoned" decision is a plain timestamp comparison — **not** a field read from the backend:

```js
const GUEST_ABANDON_TIMEOUT = 5 * 60 * 1000;        // 5 minutes
const USER_ABANDON_TIMEOUT  = 24 * 60 * 60 * 1000;  // 24 hours

const updatedAt = new Date(cart_obj.updated_at).getTime();
const timeout   = isLoggedIn ? USER_ABANDON_TIMEOUT : GUEST_ABANDON_TIMEOUT;
const timedOut  = Date.now() - updatedAt > timeout;
```

- `"timed"` only proceeds if `timedOut` is true.
- `"forced"` always proceeds regardless of elapsed time.
- `"beacon"` skips the time check entirely (guest-only, fire-and-forget).
- Early exits: no cart id, no billing email yet, empty cart, or `cart_obj.is_abandoned` already truthy (won't double-fire).

`updated_at` is refreshed to "now" on every real cart mutation (add/remove item), so normal shopping activity keeps resetting the abandonment clock — only genuine inactivity (or tab close, or logout) trips it.

---

## 4. Recording it

Once a fire condition is met, a payload is built:
```js
const sendCart = {
  ...cart_obj,
  abandoned_cart_id: cart_obj.cart_id,
  items: mapOrderItems(cart_obj.items ?? []),
  ...user_obj, // billing/shipping info
};
```

- **Beacon path** (guest, tab closing): `navigator.sendBeacon("/api/abandoned-carts/create", blob)` — best-effort, response not read, survives page unload.
- **Timed/forced path**: `await sendAbandonedCart(sendCart)` → `POST /api/abandoned-carts/create` → proxies to `${NEXT_SOLANA_BACKEND_URL}/api/abandoned-carts/create/` with `X-Store-Domain` header (`src/pages/api/abandoned-carts/create.js`).
  - On `{ success: true }`: proceed to Redis write (below).
  - On `data?.code === "DUPLICATE_CART_ID"`: skip re-notifying the backend, but still sync Redis so local state matches.

On success:
```js
const now = new Date().toISOString();
await updateRedisAbandonedRecord(`abandoned:${cart_id}`, now); // writes the Redis key from §2
await saveCart({ ...cart_obj, is_abandoned: now, updated_at: now }); // persists to Django (logged-in) or localForage (guest)
setCart(updated);
```

---

## 5. Rehydrating on load

Every time the cart is fetched — `userCartGet` (`auth.js`, logged-in) or `getGuestCart` (`cart.js`, guest) — the code separately calls `redisGet(\`abandoned:${cart_id}\`)` and merges the result in as `is_abandoned`. **The Django cart record itself carries no abandonment field.** Redis, keyed by `cart_id`, is the sole source of truth for whether a cart is flagged.

---

## 6. Resuming after abandonment

Any cart-mutating action (`addItemToCart`, `addItemsToCart`, `removeCartItem`, etc.) checks first:
```js
if (newCart?.is_abandoned) newCart = await resetAbandonedCart(newCart);
```
`resetAbandonedCart` (`cart.js:356-366`):
- Guest: mints a fresh local `id`/`cart_id`, clears `is_abandoned`.
- Logged-in: strips the old `cart_id`/`id` off the cart object, then calls `userCartCreate` with what's left — the backend hands back a brand-new cart/cart_id. The old `abandoned:{old_cart_id}` Redis key is never explicitly deleted; it's just orphaned since nothing references that ID anymore.

---

## Summary (one paragraph)

A 2s-debounced activity listener plus a visibility/beforeunload listener watch the cart. When enough time passes without activity (5 min for guests, 24h for logged-in users) — or immediately on tab-close/logout — the client notifies the Django backend (`/api/abandoned-carts/create`) and writes a plain, non-expiring `abandoned:{cart_id} → timestamp` key to Redis through a generic `/api/redis` KV proxy. That key is read back on every cart load to decide whether to show the cart as abandoned, and gets implicitly cleared the next time the user adds/removes an item, because that action mints a brand-new `cart_id` rather than reusing the flagged one.
