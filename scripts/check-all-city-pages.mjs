#!/usr/bin/env node
// Checks the /all-city/ pages (docs/reference/all-city-pages.md §3.8, §3.10).
//
//   node scripts/check-all-city-pages.mjs                  issues report from the seed
//   node scripts/check-all-city-pages.mjs --live <origin> [--sample N] [--slugs a,b]
//                                                          also render pages and compare
//
// The issues report names every record worth a look, check by check: the same
// city and state twice, a `-N` slug, identical titles or descriptions, an h1
// without the city's name, an h1 naming another city on the same depot.
//
// --live fetches each page from <origin> (a dev server, staging) and compares
// its <title>, meta description, canonical, h1 and status with the seed, which
// is WordPress's own values. --sample takes N pages spread over every depot
// (default 60); --slugs checks exactly those. Exits 1 on any mismatch.

import fs from 'node:fs'

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const seed = JSON.parse(fs.readFileSync('lib/data/allCityPages.json', 'utf8'))

// Decode the rows (the same rules as lib/allCitySeed.ts).
const pages = seed.rows.map(([slug, city, h1, title, desc, depotKey, flags, keyword]) => ({
  slug,
  city,
  h1,
  depotKey,
  variant: flags & 8 ? 'depotCity' : 'city',
  keyword: keyword ?? null,
  noindex: Boolean(flags & 4),
  title: typeof title === 'number' ? `${h1} | ${seed.titleEndings[title]}` : title,
  description: Array.isArray(desc) ? `${desc[0]}. ${seed.descriptionTails[desc[1]]}` : desc,
}))
const state = (p) => p.depotKey.slice(-2).toUpperCase()

function groups(key) {
  const map = new Map()
  for (const p of pages) {
    const k = key(p)
    if (!k) continue
    map.set(k, [...(map.get(k) ?? []), p])
  }
  return [...map.values()].filter((g) => g.length > 1)
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const report = [
  ['Same city and state twice', groups((p) => `${state(p)}|${norm(p.city)}`).map((g) => g.map((p) => p.slug).join(' / '))],
  ['Slug ending in -N (a WordPress copy)', pages.filter((p) => /-\d+$/.test(p.slug)).map((p) => `${p.slug}${p.noindex ? ' (noindex)' : ''}`)],
  ['Identical SEO title', groups((p) => norm(p.title)).map((g) => `${g.map((p) => p.slug).join(' / ')}: "${g[0].title}"`)],
  ['Identical description', groups((p) => norm(p.description)).map((g) => g.map((p) => p.slug).join(' / '))],
  [
    'No SEO description, or WordPress’s default title ("<city> - OnsiteStorage")',
    pages.filter((p) => !p.description || / - OnsiteStorage$/.test(p.title)).map((p) => `${p.slug}: "${p.title}"`),
  ],
  [
    'h1 without the city name',
    pages.filter((p) => p.variant === 'city' && !norm(p.h1).includes(norm(p.city))).map((p) => `${p.slug}: "${p.h1}" (city ${p.city})`),
  ],
]
// An h1 naming another city of the same depot (hamlin-tx showing Hamilton's).
const citiesByDepot = new Map()
for (const p of pages) citiesByDepot.set(p.depotKey, [...(citiesByDepot.get(p.depotKey) ?? []), norm(p.city)])
report.push([
  'h1 naming another city',
  pages
    .filter((p) => !norm(p.h1).includes(norm(p.city)))
    .flatMap((p) => {
      const other = citiesByDepot.get(p.depotKey).find((c) => c.length > 3 && c !== norm(p.city) && ` ${norm(p.h1)} `.includes(` ${c} `))
      return other ? [`${p.slug}: "${p.h1}" names ${other}`] : []
    }),
])

console.log(`seed ${seed.takenAt}: ${pages.length} pages, ${pages.filter((p) => p.variant === 'depotCity').length} depot-city\n`)
for (const [name, items] of report) {
  console.log(`${name}: ${items.length}`)
  for (const item of items) console.log(`  ${item}`)
}

const origin = flag('--live')
if (origin) {
  const wanted = flag('--slugs')?.split(',')
  let sample = wanted ? pages.filter((p) => wanted.includes(p.slug)) : []
  if (!wanted) {
    // Spread over every depot and both variants, then fill up evenly.
    const n = Number(flag('--sample') ?? 60)
    const byDepot = new Map()
    for (const p of pages) byDepot.set(p.depotKey, [...(byDepot.get(p.depotKey) ?? []), p])
    sample = [...byDepot.values()].map((g) => g[0])
    sample.push(...pages.filter((p) => p.variant === 'depotCity').slice(0, 5))
    const step = Math.max(1, Math.floor(pages.length / n))
    for (let i = 0; sample.length < n && i < pages.length; i += step) sample.push(pages[i])
    sample = [...new Map(sample.map((p) => [p.slug, p])).values()]
  }

  const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  const tag = (html, re) => decode(html.match(re)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '')
  let bad = 0
  console.log(`\nlive check against ${origin}: ${sample.length} pages`)
  for (const p of sample) {
    const res = await fetch(`${origin}/all-city/${p.slug}`, { redirect: 'manual', signal: AbortSignal.timeout(180_000) })
    const html = await res.text()
    const got = {
      status: res.status,
      title: tag(html, /<title>([\s\S]*?)<\/title>/),
      description: tag(html, /<meta name="description" content="([^"]*)"/),
      canonical: tag(html, /<link rel="canonical" href="([^"]*)"/).replace(/^https?:\/\/[^/]+/, ''),
      h1: tag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
    }
    const expected = { status: 200, title: p.title, description: p.description, canonical: `/all-city/${p.slug}`, h1: p.variant === 'depotCity' ? p.city : p.h1 }
    const diffs = Object.keys(expected).filter((k) => String(got[k]) !== String(expected[k]))
    if (diffs.length) {
      bad++
      console.log(`  ✗ ${p.slug}: ${diffs.map((k) => `${k} "${got[k]}" ≠ "${expected[k]}"`).join('; ')}`)
    }
  }
  console.log(bad ? `${bad} of ${sample.length} pages differ` : `all ${sample.length} pages match`)
  process.exitCode = bad ? 1 : 0
}
