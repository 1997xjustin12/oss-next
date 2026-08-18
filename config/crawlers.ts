// Which automated clients are welcome, and why.
//
// robots.txt is a policy document, not a config file — the interesting part of
// every line is the reason behind it, and that reason is what disappears first
// when the rules live as bare strings in app/robots.ts. Each entry here carries
// its purpose so the next person to edit this list can tell an intentional
// block from a copy-pasted one.
//
// Policy set 2026-08-10: allow crawlers that cite and link back, disallow
// crawlers that only collect training data. Revisit quarterly — see
// docs/audits/AGENTIC_READINESS.md D1.

export type CrawlerPurpose =
  /** Collects pages to train a model. Sends no traffic back. */
  | 'training'
  /** Builds the index behind an AI answer engine. Answers cite and link us. */
  | 'ai-search'
  /** Fetches a page because a user asked an assistant about it, right now. */
  | 'user-initiated'
  /** Classic web search. */
  | 'search';

export type Crawler = {
  /** Exact User-agent token, as the operator publishes it. */
  userAgent: string;
  operator: string;
  purpose: CrawlerPurpose;
  allow: boolean;
  /** Why this entry is set the way it is. Kept short; kept honest. */
  reason: string;
};

/**
 * Paths no crawler should spend budget on. Private, per-session, or with no
 * standalone content. Pages under these paths also carry their own
 * `robots: { index: false }` metadata — this list is the belt to that's braces,
 * and both read from here so they cannot drift.
 */
export const DISALLOWED_PATHS: readonly string[] = [
  '/my-account',
  '/cart',
  '/checkout',
  '/wishlist',
] as const;

/**
 * Is this path under a disallowed prefix?
 *
 * Used by lib/seo.ts to force `noindex` on these pages regardless of what the
 * page defaults or an admin Page Configurator override say. robots.txt asks a
 * crawler not to fetch; the meta tag tells one that fetched anyway not to
 * index. Both now derive from DISALLOWED_PATHS, so they cannot disagree — and
 * an admin cannot accidentally publish the checkout page by ticking a box.
 */
export function isDisallowedPath(path: string): boolean {
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  return DISALLOWED_PATHS.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

export const CRAWLERS: readonly Crawler[] = [
  // ── Classic search ────────────────────────────────────────────────────────
  {
    userAgent: 'Googlebot',
    operator: 'Google',
    purpose: 'search',
    allow: true,
    reason: 'Primary organic search channel.',
  },
  {
    userAgent: 'Bingbot',
    operator: 'Microsoft',
    purpose: 'search',
    allow: true,
    reason: 'Organic search, and the index behind Copilot.',
  },

  // ── AI answer engines: allowed, because their answers link back ───────────
  {
    userAgent: 'OAI-SearchBot',
    operator: 'OpenAI',
    purpose: 'ai-search',
    allow: true,
    reason: 'Builds the ChatGPT search index. Results cite and link the source.',
  },
  {
    userAgent: 'Claude-SearchBot',
    operator: 'Anthropic',
    purpose: 'ai-search',
    allow: true,
    reason: 'Builds the Claude search index. Results cite and link the source.',
  },
  {
    userAgent: 'PerplexityBot',
    operator: 'Perplexity',
    purpose: 'ai-search',
    allow: true,
    reason: 'Answer engine that cites sources inline.',
  },
  {
    userAgent: 'Applebot',
    operator: 'Apple',
    purpose: 'search',
    allow: true,
    reason: 'Siri and Spotlight suggestions. Distinct from Applebot-Extended.',
  },

  // ── User-initiated fetches: allowed, these are real people ────────────────
  {
    userAgent: 'ChatGPT-User',
    operator: 'OpenAI',
    purpose: 'user-initiated',
    allow: true,
    reason: 'Fetches a page because a user asked about it. Blocking this blocks a customer.',
  },
  {
    userAgent: 'Claude-User',
    operator: 'Anthropic',
    purpose: 'user-initiated',
    allow: true,
    reason: 'Fetches a page on a user’s behalf during a conversation.',
  },
  {
    userAgent: 'Perplexity-User',
    operator: 'Perplexity',
    purpose: 'user-initiated',
    allow: true,
    reason: 'Fetches a page on a user’s behalf during a conversation.',
  },

  // ── Training crawlers: disallowed, no traffic comes back ──────────────────
  {
    userAgent: 'GPTBot',
    operator: 'OpenAI',
    purpose: 'training',
    allow: false,
    reason: 'Training corpus collection. No citation, no referral traffic.',
  },
  {
    userAgent: 'ClaudeBot',
    operator: 'Anthropic',
    purpose: 'training',
    allow: false,
    reason: 'Training corpus collection. No citation, no referral traffic.',
  },
  {
    userAgent: 'Google-Extended',
    operator: 'Google',
    purpose: 'training',
    allow: false,
    reason:
      'Gemini training opt-out only. Does NOT affect Googlebot or Search ranking — this is safe to disallow.',
  },
  {
    userAgent: 'Applebot-Extended',
    operator: 'Apple',
    purpose: 'training',
    allow: false,
    reason: 'Apple Intelligence training opt-out only. Does not affect Applebot or Siri results.',
  },
  {
    userAgent: 'Meta-ExternalAgent',
    operator: 'Meta',
    purpose: 'training',
    allow: false,
    reason: 'Llama training corpus collection.',
  },
  {
    userAgent: 'Amazonbot',
    operator: 'Amazon',
    purpose: 'training',
    allow: false,
    reason: 'Alexa/model data collection with no discovery benefit to a container retailer.',
  },
  {
    userAgent: 'CCBot',
    operator: 'Common Crawl',
    purpose: 'training',
    allow: false,
    reason: 'Public crawl archive that feeds most third-party training sets indiscriminately.',
  },
  {
    userAgent: 'Bytespider',
    operator: 'ByteDance',
    purpose: 'training',
    allow: false,
    reason: 'Aggressive crawl rate, training-only, historically ignores robots.txt.',
  },
] as const;

/** Lookup by exact User-agent token. */
export const CRAWLERS_BY_UA: ReadonlyMap<string, Crawler> = new Map(
  CRAWLERS.map((c) => [c.userAgent.toLowerCase(), c]),
);

/**
 * Identify a crawler from a raw User-Agent header.
 *
 * Substring match, not equality: real agents send a full UA string with the
 * token embedded (`Mozilla/5.0 ... ; GPTBot/1.2; +https://openai.com/gptbot`).
 * Longest token wins, so `Applebot-Extended` is never mistaken for `Applebot`.
 */
export function identifyCrawler(userAgent: string | null | undefined): Crawler | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  let match: Crawler | undefined;
  for (const crawler of CRAWLERS) {
    const token = crawler.userAgent.toLowerCase();
    if (!ua.includes(token)) continue;
    if (!match || token.length > match.userAgent.length) match = crawler;
  }
  return match;
}
