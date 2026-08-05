import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/config/cache';
import { STORE_KEY } from '@/config/store';
import { NATIVE_PAGES } from '@/config/pages';
import { getRedisClient } from '@/lib/redis';
import type { HeadScript, PageSeo, ScriptStrategy } from '@/types/seo';

// Reads/writes the per-page SEO overrides authored in the admin Page
// Configurator.
//
// Key shape: oss-next:<store>:seo:<path>
//   oss-next:onsite:seo:/
//   oss-next:onsite:seo:/sale-shipping-containers
//   oss-next:bbq:seo:/cart
//
// The `oss-next:` prefix keeps this app off the reference app's keys in the
// shared Upstash instance; the `<store>` segment keeps the four storefronts off
// each other's. The path is stored verbatim so keys stay greppable in Redis.

const KEY_PREFIX = 'oss-next';

export function seoKey(path: string): string {
  return `${KEY_PREFIX}:${STORE_KEY}:seo:${path}`;
}

const VALID_STRATEGIES: readonly ScriptStrategy[] = ['afterInteractive', 'lazyOnload'];

/**
 * Redis holds whatever was last written, which may predate a change to the
 * `PageSeo` shape. Normalising on read means the storefront never renders a
 * half-formed record — a malformed field is dropped, not rendered.
 */
function normalize(raw: unknown): PageSeo | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

  const robots =
    value.robots && typeof value.robots === 'object'
      ? {
          index: (value.robots as Record<string, unknown>).index !== false,
          follow: (value.robots as Record<string, unknown>).follow !== false,
        }
      : undefined;

  const og = value.openGraph as Record<string, unknown> | undefined;
  const openGraph = og
    ? { title: str(og.title), description: str(og.description), image: str(og.image) }
    : undefined;

  const scripts: HeadScript[] = Array.isArray(value.scripts)
    ? (value.scripts as unknown[]).flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const s = entry as Record<string, unknown>;
        const id = str(s.id);
        const src = str(s.src);
        const code = str(s.code);
        // A script with neither a src nor a body is an empty row, not a script.
        if (!id || (!src && !code)) return [];
        const strategy = VALID_STRATEGIES.includes(s.strategy as ScriptStrategy)
          ? (s.strategy as ScriptStrategy)
          : 'lazyOnload';
        return [
          {
            id,
            name: str(s.name) ?? id,
            // src wins when both are somehow present — an external file is the
            // less surprising of the two to execute.
            ...(src ? { src } : { code }),
            strategy,
            enabled: s.enabled !== false,
          },
        ];
      })
    : [];

  const keywords = Array.isArray(value.keywords)
    ? (value.keywords as unknown[]).flatMap((k) => (str(k) ? [str(k) as string] : []))
    : undefined;

  return {
    title: str(value.title),
    description: str(value.description),
    keywords: keywords?.length ? keywords : undefined,
    canonical: str(value.canonical),
    robots,
    openGraph,
    scripts: scripts.length ? scripts : undefined,
    updatedAt: str(value.updatedAt),
  };
}

/**
 * The overrides for one page, or null when none have been saved.
 *
 * Never throws: an unreachable or unconfigured Redis must not take the
 * storefront down, it must just mean "no overrides".
 */
export async function getPageSeo(path: string): Promise<PageSeo | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SEO);

  try {
    const raw = await getRedisClient().get<unknown>(seoKey(path));
    return normalize(raw);
  } catch (error) {
    console.error(`[seo] failed reading overrides for ${path}:`, error);
    return null;
  }
}

/**
 * Every native page's overrides in one round-trip, keyed by path. Used by the
 * admin list so it can show which pages are customised without N reads.
 */
export async function getAllPageSeo(): Promise<Record<string, PageSeo | null>> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SEO);

  const paths = NATIVE_PAGES.map((page) => page.path);
  const empty = Object.fromEntries(paths.map((path) => [path, null]));

  try {
    const values = await getRedisClient().mget<unknown[]>(...paths.map(seoKey));
    return Object.fromEntries(paths.map((path, i) => [path, normalize(values?.[i])]));
  } catch (error) {
    console.error('[seo] failed reading overrides:', error);
    return empty;
  }
}

/** Writes the record. Callers must revalidate CACHE_TAGS.SEO afterwards. */
export async function savePageSeo(path: string, seo: PageSeo): Promise<void> {
  await getRedisClient().set(seoKey(path), seo);
}

/** Drops the record so the page reverts to the defaults in its own source. */
export async function deletePageSeo(path: string): Promise<void> {
  await getRedisClient().del(seoKey(path));
}
