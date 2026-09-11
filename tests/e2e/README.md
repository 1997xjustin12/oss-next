# End-to-end journeys

A visitor finding a container and reaching checkout — as a guest and as a
registered customer — driven through the real UI in a real browser.

```bash
npm run test:e2e                    # build, start, run everything
npm run test:e2e -- --project=desktop
npm run test:e2e -- --ui            # watch it run, step by step
npx playwright show-report          # the HTML report from the last run
```

If a server is already running on port 3000 it is reused, which saves the
build while you iterate. Stop `next dev` first if you want the production
build tested — that is what customers get.

## What "no errors" means

Every test runs under a guard (`fixtures.ts`) and fails if, at any point:

- the page throws, or logs a console error;
- a request to this site returns 4xx or 5xx;
- the page shows "Something Went Wrong" or "Page Not Found".

Known, already-reported defects are listed in `KNOWN_ISSUES` with a reason.
They are recorded on the test instead of failing it, so the suite catches
*new* breakage. Delete an entry once it is fixed.

## Side effects — what is blocked

These run against the real backend, so anything that reaches sales, charges a
card or sends email is answered with an empty success in the browser:

| Blocked | Why |
|---|---|
| `/api/abandoned-carts/*` | abandoned-cart records and their emails |
| `/api/braintree_checkout`, `/api/orders/checkout` | the charge and the order — never reached anyway, no test presses Place Order |
| `/api/subscribers/subscribe` | newsletter sign-up |
| `/api/auth/register` | new accounts |

**Not** blocked: `/api/cart/*`. A signed-in cart is saved to the backend and
the registered journeys test that it survives login, so those tests remove
exactly the lines they added, afterwards.

**Opt-in:** submitting the delivery-quote form records a lead in
Admin → Quote Requests, so the guest route that does it stops at the form
unless you set `E2E_ALLOW_LEADS=1`.

## Configuration

In `.env.local` (untracked):

```
E2E_USER=...        # a storefront account
E2E_PASSWORD='...'  # single-quoted: .env values expand `$`
```

The registered journeys are skipped without them.

## Journeys

**Guest**

- Route A — home → listing → product → ZIP → cart → checkout detours to the quote form
- Route B — product → Save Quote → details → cart → checkout, pre-filled
- "Save your cart?" asks once, then stays dismissed
- A container in the cart blocks a ZIP change to another depot
- An accessory goes from the listing into the cart

**Registered**

- Log in → add a container → checkout, with no quote-form detour
- A cart built as a guest survives logging in
- Order history → Buy Again re-adds a container as a container

Tagged `@mobile` journeys run a second time at phone size.
