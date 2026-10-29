// Cutover check: does every URL WordPress answers today still land somewhere
// on this app? Requests each one against a deployment and reports what
// doesn't.
//
//   node scripts/check-wp-urls.mjs                       # crawl WordPress's sitemaps, check staging
//   node scripts/check-wp-urls.mjs --target https://onsitestorage.com --list local/wp-urls.tsv
//   node scripts/check-wp-urls.mjs --redirects local/redirection-export.csv
//
// Options:
//   --target <origin>     deployment to check (default https://staging.onsitestorage.com)
//   --source <origin>     WordPress, for its sitemaps (default https://onsitestorage.com)
//   --list <file>         use a saved URL list instead of crawling. The crawl saves
//                         one to local/wp-urls.tsv: keep it, because once the domain
//                         points at this app, WordPress's sitemaps are gone
//   --redirects <file>    also check the sources in WordPress's redirect export (any
//                         CSV or text file: the first field of a line that starts
//                         with "/" is taken; regex rows are skipped)
//   --only <types>        e.g. page,post (types are the sitemap names: page, post,
//                         product, product_cat, delivered_containers, …; "redirect")
//   --concurrency <n>     parallel requests (default 8)
//   --out <file>          report (default local/wp-url-check-<date>.csv)
//
// Each URL is followed through its redirects (up to 5) and classed:
//   ok          200 as asked
//   redirected  3xx, ending in a 200
//   missing     ends in 404 or 410: a link that breaks at cutover
//   broken      5xx, a loop, too many hops, or no answer (after one retry)
// The report lists every URL that isn't "ok" or "redirected".
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const TARGET = opt('target', 'https://staging.onsitestorage.com').replace(/\/+$/, '')
const SOURCE = opt('source', 'https://onsitestorage.com').replace(/\/+$/, '')
const LIST = opt('list')
const REDIRECTS = opt('redirects')
const ONLY = opt('only')?.split(',')
const CONCURRENCY = Number(opt('concurrency', 8))
const OUT = opt('out', `local/wp-url-check-${new Date().toISOString().slice(0, 10)}.csv`)
const UA = 'Mozilla/5.0 (compatible; oss-cutover-check)'

/** A URL as a path: no origin, no trailing slash ("/" stays "/"). */
const toPath = (url) => url.replace(/^https?:\/\/[^/]+/i, '').replace(/\/+$/, '') || '/'

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.text()
}

/** Every URL in WordPress's sitemaps (Yoast), typed by sitemap file: page, post, product, … */
async function crawlSitemaps() {
  const index = await get(`${SOURCE}/sitemap_index.xml`)
  const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const rows = []
  for (const file of files) {
    const type = file.split('/').pop().replace(/\.xml$/, '').replace(/\d+$/, '').replace(/-sitemap$/, '')
    const xml = await get(file)
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) rows.push({ type, path: toPath(loc) })
    console.log(`  ${file.split('/').pop()}: ${rows.filter((r) => r.type === type).length} so far (${type})`)
  }
  return rows
}

function readRedirectExport(file) {
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((line) => !/\bregex\b.*\b(1|true)\b/i.test(line) && !/[\^$*(]/.test(line.split(/[,\t]/)[0] ?? ''))
    .map((line) => line.split(/[,\t]/).map((f) => f.trim().replace(/^"|"$/g, '')).find((f) => f.startsWith('/')))
    .filter(Boolean)
    .map((source) => ({ type: 'redirect', path: toPath(source) }))
}

/** Follows redirects by hand, so the chain is known. */
async function check(path) {
  let url = `${TARGET}${path}`
  const seen = new Set()
  for (let hop = 0; hop <= 5; hop++) {
    if (seen.has(url)) return { result: 'broken', status: 'loop', final: url }
    seen.add(url)
    let res
    for (let attempt = 1; ; attempt++) {
      try {
        res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) })
        if (res.status >= 500 && attempt === 1) throw new Error(`HTTP ${res.status}`)
        break
      } catch (error) {
        if (attempt === 2) return { result: 'broken', status: String(error.message ?? error).slice(0, 60), final: url }
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }
    await res.body?.cancel()
    const location = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url).toString()
      continue
    }
    const final = toPath(url)
    if (res.status === 200) return { result: hop === 0 ? 'ok' : 'redirected', status: 200, final }
    if (res.status === 404 || res.status === 410) return { result: 'missing', status: res.status, final }
    return { result: 'broken', status: res.status, final }
  }
  return { result: 'broken', status: 'too many redirects', final: toPath(url) }
}

// ── Run ──────────────────────────────────────────────────────────────────────

let rows
if (LIST) {
  rows = readFileSync(LIST, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => {
    const [type, path] = line.split('\t')
    return { type, path }
  })
  console.log(`${rows.length} URLs from ${LIST}`)
} else {
  console.log(`Crawling ${SOURCE}/sitemap_index.xml`)
  rows = await crawlSitemaps()
  mkdirSync('local', { recursive: true })
  writeFileSync('local/wp-urls.tsv', rows.map((r) => `${r.type}\t${r.path}`).join('\n') + '\n')
  console.log(`${rows.length} URLs, saved to local/wp-urls.tsv`)
}
if (REDIRECTS) {
  const extra = readRedirectExport(REDIRECTS)
  console.log(`${extra.length} redirect sources from ${REDIRECTS}`)
  rows.push(...extra)
}
// One check per path; keep the first type it was listed under.
const byPath = new Map()
for (const row of rows) if (!byPath.has(row.path)) byPath.set(row.path, row)
let queue = [...byPath.values()]
if (ONLY) queue = queue.filter((r) => ONLY.includes(r.type))

console.log(`Checking ${queue.length} URLs against ${TARGET} (${CONCURRENCY} at a time)`)
const results = []
let done = 0
const started = Date.now()
async function worker() {
  while (queue.length) {
    const row = queue.shift()
    results.push({ ...row, ...(await check(row.path)) })
    if (++done % 250 === 0) console.log(`  ${done} checked (${Math.round((Date.now() - started) / 1000)}s)`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

// Summary: type × result.
const classes = ['ok', 'redirected', 'missing', 'broken']
const types = [...new Set(results.map((r) => r.type))].sort()
console.log(`\n${'type'.padEnd(22)}${classes.map((c) => c.padStart(11)).join('')}`)
for (const type of types) {
  const of = results.filter((r) => r.type === type)
  console.log(`${type.padEnd(22)}${classes.map((c) => String(of.filter((r) => r.result === c).length).padStart(11)).join('')}`)
}
const bad = results.filter((r) => r.result === 'missing' || r.result === 'broken').sort((a, b) => a.type.localeCompare(b.type) || a.path.localeCompare(b.path))
console.log(`${'total'.padEnd(22)}${classes.map((c) => String(results.filter((r) => r.result === c).length).padStart(11)).join('')}`)

mkdirSync(dirname(OUT), { recursive: true })
const csv = (v) => `"${String(v).replace(/"/g, '""')}"`
writeFileSync(OUT, ['type,path,result,status,final', ...bad.map((r) => [r.type, r.path, r.result, r.status, r.final].map(csv).join(','))].join('\n') + '\n')
console.log(`\n${bad.length} URLs to fix, listed in ${OUT}`)
