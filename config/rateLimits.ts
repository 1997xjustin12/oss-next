// Per-minute request budgets, by bucket.
//
// Buckets are counted separately — each gets its own Redis key — so a burst of
// cheap reads can never consume the budget for something expensive. Before
// these existed everything shared one counter, which meant 60 catalogue
// searches locked out a quote submission for the rest of the minute.
//
// The numbers are chosen by what a limit is protecting, not by traffic:
//
//   light   — availability and product-card lookups. Cheap, called on almost
//             every page, so this only has to stop a runaway loop.
//   agent   — the public JSON API for AI agents. Real work per request, but
//             all of it ours and all of it cached.
//   chat    — the one bucket that bounds **spend** rather than load: every
//             message costs a backend model call. A real conversation is a
//             handful of messages a minute; past 20 it is a script.
//   quote   — each submission reaches a person.
//   auth    — sign-in, lost-password and reset-password on this site. A person
//             signs in once or twice; past 10 a minute it is a script trying
//             passwords or flooding someone's inbox. The backend also locks an
//             account after 5 wrong passwords — this stops the attempts before
//             they reach it.
//   newsletter — a signup writes a Contact to Zoho CRM and a subscriber to the
//             backend. A person signs up once; past 5 a minute it is a script.
//   beacon  — the homepage A/B tracker's reports (/api/ab/home). A view sends
//             one or two; past 30 a minute from one address it is a script
//             trying to skew the test. Checked inside the write itself
//             (lib/homeAbStore.ts), so it costs no extra Redis request.

export const RATE_LIMIT_BUCKETS = {
  light: 300,
  agent: 60,
  chat: 20,
  quote: 5,
  auth: 10,
  newsletter: 5,
  beacon: 30,
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMIT_BUCKETS;

/** What an unqualified call gets — the pre-existing public-API budget. */
export const DEFAULT_RATE_LIMIT_BUCKET: RateLimitBucket = 'agent';
