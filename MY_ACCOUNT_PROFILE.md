# My Account → Profile page — implementation, endpoint, and params

Extracted from `src/app/(market)/my-account/profile/page.jsx` (just renders `ProfilePage`) and the real component: `src/app/components/new-design/sections/my-account/ProfilePage.jsx`.

---

## How it's implemented

**State seeding**: `form` is initialized from `useAuth()`'s `user` object and kept in sync via:
```js
useEffect(() => setForm(user), [user]);
```
So this form always edits a live copy of whatever `GET /api/profile` last returned — it's not a separately-fetched copy.

**Field routing** (`handleChange`, `ProfilePage.jsx:45-54`) — a single handler branches on field name:
```js
const rootFields = ["first_name", "last_name"];
setForm((prev) => rootFields.includes(name)
  ? { ...prev, [name]: value }                              // top-level
  : { ...prev, profile: { ...prev.profile, [name]: value } } // everything else nests under `profile`
);
```
`first_name`/`last_name` live at the root of the user object; `phone` and all billing/shipping fields live under a nested `profile` object.

**Submit** (`handleSubmit`) calls `updateProfile(form)` (`src/app/context/auth.js:347-359`):
```js
const updateProfile = useCallback(async (updatedData) => {
  const res = await fetch("/api/profile/update", {
    method:  "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify(updatedData), // the ENTIRE form object, not a diff
  });
  if (!res.ok) return res;
  setUser(injectUserFields(await res.json()));
  return res;
}, [accessToken]);
```
The proxy (`src/pages/api/profile/update.js`) forwards straight through to `PUT ${NEXT_SOLANA_BACKEND_URL}/api/auth/profile` with the `X-Store-Domain` header and the forwarded Bearer token — **same URL as `GET /api/profile`, just a different HTTP method.**

On success, the response is run back through `injectUserFields()` and set as the new `user` state, so the update response is expected to have the same shape as the GET response.

---

## Endpoint

```
PUT /api/profile/update
  → proxies to PUT {NEXT_SOLANA_BACKEND_URL}/api/auth/profile
  Headers: Authorization: Bearer <accessToken>, X-Store-Domain: <NEXT_PUBLIC_STORE_DOMAIN>
```

## Params/fields sent

```
first_name        (root)
last_name         (root)
profile: {
  phone
  billing_address
  billing_country
  billing_city
  billing_state
  billing_zip
  shipping_address
  shipping_country
  shipping_city
  shipping_state
  shipping_zip
}
```

---

## Two things worth noting for a rebuild

1. **It's a full-object `PUT`, not a partial patch.** `form` starts as a full copy of the fetched `user`, so the request body includes every field already on the user record (including ones this form never renders, like `email`) merged with the edited ones. There's no diffing or field allowlist before sending — the whole object goes out every time.
2. **It also sends derived/computed fields back to the backend.** `injectUserFields()` (`auth.js:91-98`) adds `full_name` and `name_initials` onto the `user` object client-side after every fetch:
   ```js
   function injectUserFields(data) {
     if (!data) return null;
     return {
       ...data,
       full_name: `${capitalizeFirstLetter(data.first_name || "")} ${capitalizeFirstLetter(data.last_name || "")}`.trim(),
       name_initials: `${data.first_name?.[0] || ""}${data.last_name?.[0] || ""}`.toUpperCase(),
     };
   }
   ```
   Since `form` is seeded directly from `user`, those computed fields ride along in the update payload too. The backend presumably ignores unknown fields, but if you're porting this to a stricter typed backend, strip `full_name`/`name_initials` before sending rather than copy this behavior as-is.

No email field is editable in this form (not rendered, though `email` is presumably still part of the underlying user object). No client-side validation beyond the HTML5 `required` attribute — no zip/phone format checks.
