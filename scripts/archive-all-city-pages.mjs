#!/usr/bin/env node
// Archives WordPress's /all-city/ pages (the "Cities" post type, 8,500+ city
// landing pages) into lib/data/allCityPages.json, read by lib/allCity.ts.
//
//   node scripts/archive-all-city-pages.mjs [cacheDir] [--refresh]
//
// Each source is cached in cacheDir (default: <os temp>/oss-all-city, outside
// the repo) so a re-run resumes instead of starting over:
//   records.json   every post (slug, title, tags, Yoast title/description/robots), REST API
//   tags.json      the tag names, REST API
//   h1.jsonl       each live page's first <h1> and Elementor template id. The h1
//                  is not in the REST API (a custom field), so it is read from
//                  the page; the download stops at the h1. ~90 min for all.
//   keywords.json  the 23 depot-city pages' keyword heading (an h2 there).
// --refresh drops records.json and tags.json (not the crawl).
//
// What a row holds, and why the template's words are not in it: lib/allCity.ts
// and lib/data/allCityContent.ts. The depots (banner, products, links) are in
// lib/data/allCityDepots.ts; a tag naming a depot missing there stops the run.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const WP = 'https://old.onsitestorage.com'
const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const cacheDir = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(os.tmpdir(), 'oss-all-city'))
const OUT = path.resolve('lib/data/allCityPages.json')
fs.mkdirSync(cacheDir, { recursive: true })
const cache = (name) => path.join(cacheDir, name)

/** Depot keys lib/data/allCityDepots.ts defines. Kept here so the script runs without a TS loader; a unit test keeps the two equal. */
const DEPOT_KEYS = new Set([
  'atlanta-ga', 'baltimore-md', 'charleston-sc', 'charlotte-nc', 'chicago-il', 'cincinnati-oh', 'cleveland-oh', 'columbus-oh',
  'dallas-tx', 'denver-co', 'detroit-mi', 'el-paso-tx', 'houston-tx', 'indianapolis-in', 'jacksonville-fl', 'kansas-city-ks',
  'laredo-tx', 'miami-fl', 'raleigh-nc', 'san-antonio-tx', 'tampa-fl', 'wilmington-nc',
])
const DEPOT_STATE = Object.fromEntries([...DEPOT_KEYS].map((key) => [key, key.slice(-2).toUpperCase()]))

// WordPress's tag suffixes → depot key: two tags name Baltimore, and Indianapolis is tagged "-id".
const DEPOT_ALIASES = { md: 'baltimore-md', 'indianapolis-id': 'indianapolis-in' }
const depotKeyOf = (suffix) => DEPOT_ALIASES[suffix] ?? suffix
// A list tag's state: its last two letters ("ga", "md", "miami-fl"), Indianapolis's "id" being Indiana.
const tagState = (suffix) => (suffix === 'indianapolis-id' ? 'IN' : suffix.slice(-2).toUpperCase())

const NAMED = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m)
const text = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { json: await res.json(), headers: res.headers }
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${err.message}`)
    }
  }
}

async function fetchAllPosts() {
  const fields = 'slug,title,tags,yoast_head_json'
  const first = await getJson(`${WP}/wp-json/wp/v2/all-city?per_page=100&page=1&orderby=id&order=asc&_fields=${fields}`)
  const pages = Number(first.headers.get('x-wp-totalpages'))
  const all = [...first.json]
  for (let page = 2; page <= pages; page++) {
    all.push(...(await getJson(`${WP}/wp-json/wp/v2/all-city?per_page=100&page=${page}&orderby=id&order=asc&_fields=${fields}`)).json)
    process.stdout.write(`\rposts ${all.length}`)
  }
  console.log()
  // Only what a row needs: the full Yoast object is ~4 KB a post.
  return all.map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    yoast_head_json: {
      title: p.yoast_head_json?.title,
      description: p.yoast_head_json?.description,
      robots: { index: p.yoast_head_json?.robots?.index },
    },
  }))
}

async function fetchTags() {
  const tags = []
  for (let page = 1; ; page++) {
    const { json, headers } = await getJson(`${WP}/wp-json/wp/v2/tags?per_page=100&page=${page}&_fields=id,slug,name`)
    tags.push(...json)
    if (page >= Number(headers.get('x-wp-totalpages'))) return tags
  }
}

async function cached(name, load) {
  const file = cache(name)
  if (!refresh && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))
  const value = await load()
  fs.writeFileSync(file, JSON.stringify(value))
  return value
}

/** The page's first <h1> and template id, downloading only as far as the h1. */
async function readHeading(slug) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 90_000)
  try {
    const res = await fetch(`${WP}/all-city/${slug}/`, { signal: ctl.signal })
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let html = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      if (/<\/h1>/.test(html) && /data-elementor-type="single-page"/.test(html)) break
      if (html.length > 3_000_000) break
    }
    ctl.abort()
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
    const tpl = html.match(/data-elementor-type="single-page" data-elementor-id="(\d+)"/)
    return { slug, status: res.status, h1: h1 ? text(h1[1]) : null, tpl: tpl ? tpl[1] : null }
  } finally {
    clearTimeout(timer)
  }
}

async function crawlHeadings(slugs) {
  const file = cache('h1.jsonl')
  const done = new Map()
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
      const rec = JSON.parse(line)
      if (!rec.err) done.set(rec.slug, rec)
    }
  }
  const todo = slugs.filter((slug) => !done.has(slug))
  let next = 0
  let count = 0
  const t0 = Date.now()
  async function worker() {
    while (next < todo.length) {
      const slug = todo[next++]
      let rec
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          rec = await readHeading(slug)
          break
        } catch (err) {
          rec = { slug, err: String(err).slice(0, 80) }
        }
      }
      fs.appendFileSync(file, JSON.stringify(rec) + '\n')
      if (!rec.err) done.set(slug, rec)
      if (++count % 250 === 0) console.log(`h1 ${count}/${todo.length} ${Math.round((Date.now() - t0) / 1000)}s`)
    }
  }
  // Twelve at a time: the old host is slow (~1.6 pages/s at this rate), and it still serves visitors.
  await Promise.all(Array.from({ length: 12 }, worker))
  return done
}

/**
 * The depot-city template's keyword heading: the h2 after "WHY CHOOSE ON-SITE
 * STORAGE SOLUTIONS?" (its h1 is the city, hidden on desktop).
 */
async function readKeywordHeading(slug) {
  const res = await fetch(`${WP}/all-city/${slug}/`, { signal: AbortSignal.timeout(150_000) })
  const html = await res.text()
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]))
  const why = h2s.findIndex((h) => /^WHY CHOOSE ON-SITE STORAGE SOLUTIONS\?$/i.test(h))
  return why >= 0 ? (h2s[why + 1] ?? null) : null
}

const posts = await cached('records.json', fetchAllPosts)
const tags = await cached('tags.json', fetchTags)
const tagSlug = new Map(tags.map((t) => [t.id, t.slug]))
console.log(`${posts.length} posts, ${tags.length} tags`)

const headings = await crawlHeadings(posts.map((p) => p.slug))

const problems = []
const parsed = []
for (const post of posts) {
  const names = post.tags.map((id) => tagSlug.get(id) ?? '')
  const find = (prefix) => names.find((n) => n.startsWith(prefix))?.slice(prefix.length)
  const cityPage = find('city-page-')
  const location = find('location-')
  const popular = find('popular-cities-')
  const viewAll = find('view-all-cities-')
  const depotSuffix = location ?? cityPage
  const crawl = headings.get(post.slug)
  if (!depotSuffix) {
    // WordPress renders these without any template (two pages, no tags).
    problems.push(`${post.slug}: no depot tag (${names.join(',') || 'no tags'}): left out`)
    continue
  }
  const depotKey = depotKeyOf(depotSuffix)
  if (!DEPOT_KEYS.has(depotKey)) throw new Error(`${post.slug}: depot "${depotKey}" is not in lib/data/allCityDepots.ts`)
  if (!crawl?.tpl) {
    problems.push(`${post.slug}: live page has no template (${crawl ? `HTTP ${crawl.status}` : 'not crawled'}): left out`)
    continue
  }
  const listState = popular ? tagState(popular) : viewAll ? tagState(viewAll) : DEPOT_STATE[depotKey]
  parsed.push({ post, depotKey, depot: Boolean(location), popular: Boolean(popular), viewAll: Boolean(viewAll), listState, crawl })
}

const keywordsFile = cache('keywords.json')
const keywords = fs.existsSync(keywordsFile) ? JSON.parse(fs.readFileSync(keywordsFile, 'utf8')) : {}
for (const p of parsed.filter((p) => p.depot && !keywords[p.post.slug])) {
  keywords[p.post.slug] = await readKeywordHeading(p.post.slug)
  fs.writeFileSync(keywordsFile, JSON.stringify(keywords, null, 1))
}

// The SEO titles and descriptions mostly repeat a handful of endings.
const count = (list) => list.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map())
const common = (map) => [...map].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([k]) => k)
const titleOf = (p) => decode(p.post.yoast_head_json?.title ?? '').trim()
const descOf = (p) => decode(p.post.yoast_head_json?.description ?? '').trim()
const h1Of = (p) => (p.depot ? text(p.post.title.rendered) : p.crawl.h1)
const titleEndings = common(
  count(parsed.flatMap((p) => (h1Of(p) && titleOf(p).startsWith(`${h1Of(p)} | `) ? [titleOf(p).slice(h1Of(p).length + 3)] : []))),
)
const descriptionTails = common(count(parsed.map((p) => descOf(p)).filter((d) => d.includes('. ')).map((d) => d.slice(d.indexOf('. ') + 2))))

const rows = parsed.map((p) => {
  const city = text(p.post.title.rendered)
  const h1 = h1Of(p)
  if (!h1) problems.push(`${p.post.slug}: no h1 on the live page`)
  const title = titleOf(p)
  const ending = title.startsWith(`${h1} | `) ? titleEndings.indexOf(title.slice(h1.length + 3)) : -1
  const desc = descOf(p)
  const cut = desc.indexOf('. ')
  const tail = cut >= 0 ? descriptionTails.indexOf(desc.slice(cut + 2)) : -1
  const flags = (p.popular ? 1 : 0) | (p.viewAll ? 2 : 0) | (p.post.yoast_head_json?.robots?.index === 'noindex' ? 4 : 0) | (p.depot ? 8 : 0)
  const keyword = p.depot ? keywords[p.post.slug] : null
  if (p.depot && !keyword) problems.push(`${p.post.slug}: depot-city page without a keyword heading`)
  const stateOverride = p.listState !== DEPOT_STATE[p.depotKey] ? p.listState : null
  const row = [p.post.slug, city, h1 ?? city, ending >= 0 ? ending : title, tail >= 0 ? [desc.slice(0, cut), tail] : desc, p.depotKey, flags]
  if (keyword || stateOverride) row.push(keyword ?? null)
  if (stateOverride) row.push(stateOverride)
  return row
})

rows.sort((a, b) => a[0].localeCompare(b[0]))
const takenAt = new Date().toISOString().slice(0, 10)
fs.writeFileSync(
  OUT,
  `{\n"takenAt": ${JSON.stringify(takenAt)},\n"titleEndings": ${JSON.stringify(titleEndings)},\n"descriptionTails": ${JSON.stringify(descriptionTails)},\n"rows": [\n${rows.map((r) => JSON.stringify(r)).join(',\n')}\n]}\n`,
)

console.log(`wrote ${rows.length} pages to ${path.relative(process.cwd(), OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`)
console.log(`templates: ${rows.filter((r) => r[6] & 8).length} depot-city, ${rows.filter((r) => !(r[6] & 8)).length} city`)
console.log(`lists follow a state other than the depot's: ${rows.filter((r) => r[8]).map((r) => r[0]).join(', ') || 'none'}`)
console.log(problems.length ? `not mapped (${problems.length}):\n  ${problems.join('\n  ')}` : 'every page mapped')
