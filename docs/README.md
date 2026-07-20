# Docs

Project documentation. Code-level conventions live in `AGENTS.md` at the repo root — not here.

```
docs/
├── reference/   # Source-of-truth specs used to BUILD features
└── audits/      # Completion tracking — what's done, what's verified, what's left
    └── pdf/     # Point-in-time audit exports
```

## `reference/` — build references

Contracts and specs extracted from the original WordPress app, used as the source of truth
when building the equivalent feature here. Treat these as authoritative for field names and
API shapes, but **always verify live against the real backend before shipping.**

| File | Covers |
|---|---|
| `CART_PAGE_REF.md` | Cart page build spec |
| `CHECKOUT_PAGE_REF.md` | Checkout page build spec |
| `PLP_PAGE_REF.md` | Product Listing Page build spec |
| `MY_ACCOUNT_PAGE_REF.md` | My Account + subpages build spec |
| `MY_ACCOUNT_PROFILE.md` | Profile read/update contract (`PUT api/auth/profile`, full-object replace) |
| `HOME_PAGE_REF.html` | Homepage reference markup (desktop) |
| `HOME_PAGE_REF_MOBILE.html` | Homepage reference markup (mobile) |
| `REVIEWS_FLOW.md` | Reviews contract — list/create, purchase-gating, duplicate detection |
| `ORDER_HISTORY_ANSWER.md` | Order history contract — field names, no pagination |
| `ABANDONED_CART_EXPLAINER.md` | Abandoned-cart timeouts and notify payload |

## `audits/` — completion tracking

| File | Tracks |
|---|---|
| `AUDIT_REQUIREMENTS.md` | **Start here.** Audit method + the live task list. Read before any gap-analysis work. |
| `API_INTEGRATION_STATUS.md` | Per-endpoint status: wired, verified live, or blocked |
| `API_TRIGGER_CHECKLIST.md` | Per-user-action status: does the page/component exist and is it wired? |

`pdf/` holds dated audit exports (`AUDIT_TASK_LIST_<date>.pdf`) as a point-in-time record.
The `.md` files above are the living versions — prefer them over the PDFs.
