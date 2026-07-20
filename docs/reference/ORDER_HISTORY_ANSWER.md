# Order History — confirmed shape from this project's implementation

This project already has a working (in-code, not necessarily field-verified against a populated account — see caveats) Order History page: `src/app/components/new-design/sections/my-account/OrdersPage.jsx` (bbq-design has an identical variant). This doc extracts the real field names it reads/writes, answers your three design questions, and flags where this reference implementation itself is still unconfirmed.

---

## 1. Confirmed response shape — `GET /api/auth/orders`

`userOrdersGet()` (`src/app/context/auth.js:320-326`) does a plain `fetch` + `res.json()` with no unwrapping:
```js
const userOrdersGet = useCallback(async () => {
  const res = await fetch("/api/auth/orders", {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json();
}, [accessToken]);
```

`OrdersPage.jsx` then consumes the result **as a flat array directly**:
```js
const _orders = await userOrdersGet();
if (_orders.length === 0) setLoadingOrders(false);
setOrders(_orders);
```
and later `orders.map(...)`, `orders.flatMap(...)`.

### ⚠️ Discrepancy with what you found
You reported `GET /api/auth/orders` returning `{ orders: [] }` (object-wrapped) for an empty account. This project's code assumes a **bare array**, not `{ orders: [...] }`. If the real backend does wrap it in an `orders` key, this reference component would silently break on real data (`.length`/`.map` on a plain object → `undefined`/`TypeError`), which means **this app's Order History page has likely never been exercised against a live populated account either** — same chicken-and-egg problem you flagged, just further along (empty case "works," non-empty case untested).

**Recommendation:** build your fetch defensively —
```ts
const raw = await res.json();
const orders: Order[] = Array.isArray(raw) ? raw : (raw.orders ?? []);
```
— and treat one real non-empty account as required verification before you trust either shape.

### Order-level fields actually read (confirmed, from `OrdersPage.jsx:376-392`)
| Field | Type (inferred) | Used for |
|---|---|---|
| `order_number` | string | React key, `#{order_number}` display, `orderId` on checkout summary |
| `status` | string enum (see §3) | Status badge, gates "Write Review"/"Buy Again" buttons |
| `total_price` | number or numeric string | Header total, passed through `formatPrice()` |
| `items` | `OrderItem[]` | Line items (see below) |

No `created_at`/`date` field is read or displayed anywhere in this component — **the reference UI doesn't show an order date at all.** No shipping address, no tracking number, no payment method shown either.

### Item-level fields — confirmed vs. client-enriched
Only these are read directly off each raw order item (`OrdersPage.jsx:294,298,396-432`):
| Field | Type (inferred) | Notes |
|---|---|---|
| `product_id` | number/string | join key |
| `quantity` | number | |
| `price` | numeric string | code does `parseFloat(item?.price) * item?.quantity`, implying it arrives as a **string** |

**Everything else the UI shows (title, image, URL, compare-at price) is NOT part of the order item from the backend.** It's fetched separately:
```js
const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.product_id)))];
const { data } = await getProductsByIds(productIds); // POST /api/es/products-by-ids equivalent
// then merged client-side:
items: order.items.map((item) => {
  const product = products.find((p) => p.product_id == item.product_id);
  return { ...item, title: product?.title, image: ..., url: ..., compare_at_price: product?.variants?.[0]?.compare_at_price, product };
})
```
So don't assume the order/item record carries product title or image — the reference app treats the order as `{product_id, quantity, price}` and re-hydrates display data via a second ES lookup by `product_id`. Build your TS type the same way: a lean `OrderItem` plus a separate enrichment step.

---

## 2. Order creation payload — `POST /api/orders/checkout` (for symmetry, and because response fields likely echo these)

Built in `CheckoutComponent.jsx`. Base form shape (`initialForm`, `CheckoutComponent.jsx:24-53`):
```js
{
  status: null,
  payment_method: "braintree",
  payment_status: false,
  billing_first_name: "", billing_last_name: "", billing_email: "", billing_phone: "",
  billing_address: "", billing_city: "", billing_province: "", billing_zip_code: "", billing_country: "",
  is_valid_billing_zip: false,
  shipping_first_name: "", shipping_last_name: "", shipping_email: "", shipping_phone: "",
  shipping_address: "", shipping_city: "", shipping_province: "", shipping_zip_code: "", shipping_country: "",
  is_valid_shipping_zip: false,
  notes: "",
  items: [],
  newsletter: false,
  save_information: false,
  shipping_to_billing: true,
}
```
On successful payment (`CheckoutComponent.jsx:528-535`), the actual POST body is:
```js
{
  ...form,
  status: "paid",                       // note: lifecycle starts at "paid", not "pending", for card payments
  payment_status: true,
  payment_details: result?.transaction?.id,  // Braintree transaction id
  store_domain: STORE_DOMAIN,
  items: mapOrderItems(cartItems),      // [{ product_id, product_link, price, quantity, total }]
}
```
`mapOrderItems` (`src/app/lib/helpers.js:253-267`) produces items shaped `{ product_id, product_link, price, quantity, total }` — note **`total` here, not `price * quantity`ed later** — the create payload pre-computes it, but the read-back list (`GET /api/auth/orders`) apparently does NOT return `total` per item (the read side recomputes `price * quantity` itself, see §1). So the item shape differs slightly between write and read paths — worth confirming, don't assume symmetry.

### ⚠️ Another unconfirmed wrapper
The response-unwrapping code hedges three different ways:
```js
return { success: true, data: result.data || result.order || result };
```
i.e. this project's own author didn't know whether the create response would be `{ data: {...} }`, `{ order: {...} }`, or a flat order object — same uncertainty you're facing on the read side. `order_response.data?.order_number` is the only field pulled from the created order afterward.

---

## 3. Design question answers

**List vs. list+detail:** List only. There is no `/my-account/orders/[id]` route or detail view anywhere in this codebase — build the summary list first, matching what's already proven out; detail view is genuinely new work, not something to copy.

**Pagination:** None. `GET /api/auth/orders` is called with no `page`/`limit` query params (`src/pages/api/auth/orders.js` forwards the request as-is), and the client consumes the result as a complete array in one shot. If the backend does support pagination params, this reference app doesn't use them — start unpaginated, matching current behavior.

**Status values (confirmed, `OrdersPage.jsx:17-24`):**
```
pending | paid | shipped | delivered | cancelled | refunded
```
Badge color/label config already exists and can be ported directly:
```js
const statusConfig = {
  pending:   { label: "Pending"   },
  paid:      { label: "Paid"      },
  shipped:   { label: "Shipped"   },
  delivered: { label: "Delivered" },
  cancelled: { label: "Cancelled" },
  refunded:  { label: "Refunded"  },
};
```
Business logic gated on status in this project: "Write/Edit Review" button only shows when `status === "delivered"`; "Buy Again" button shows when status is `delivered`, `cancelled`, or `refunded`.

---

## Suggested TypeScript types (marking confirmed vs. inferred)

```ts
// CONFIRMED fields (read directly by OrdersPage.jsx) — safe to type strictly
interface OrderListItem {
  product_id: string | number;
  quantity: number;
  price: string; // arrives as string — parseFloat() before math
}

interface Order {
  order_number: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
  total_price: string | number; // formatPrice() handles both — confirm actual type with real data
  items: OrderListItem[];
  // NOT present in this project's read path — add only if your backend actually returns them:
  // created_at?: string;
  // shipping_address?: {...};
  // tracking_number?: string;
}

// Client-side enrichment (NOT part of the API response — joined separately)
interface EnrichedOrderItem extends OrderListItem {
  title?: string;
  image?: string | null;
  url?: string;
  compare_at_price?: string | number;
}
```

## Bottom line

You have real field names now (`order_number`, `status`, `total_price`, `items[].product_id/quantity/price`), a confirmed status enum, and confirmed "list-only, no pagination" scope — enough to stop guessing on structure. What's still genuinely unverified (in both this reference app and yours): whether the list response is a bare array or `{ orders: [] }`, and the create-response wrapper shape. Build both reads defensively (handle either shape) and treat **one real non-empty order** as the remaining must-have before calling either shape final — this reference app appears to have shipped without that verification, which is exactly the risk you're trying to avoid repeating.
