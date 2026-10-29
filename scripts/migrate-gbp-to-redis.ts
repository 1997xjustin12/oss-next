/**
 * One-time migration: the GBP pages' code seed → their published records in
 * Redis (docs/reference/gbp-subdomain-pages.md, "Build order", step 4).
 *
 * Writes every location page, the shared content and the default template,
 * each through the same validators the pages use, in the envelope
 * services/gbp.service.ts reads. Refuses to overwrite a record that already
 * exists unless --force: after the migration, Redis is the source of truth and
 * an admin's published edits must not be clobbered by the seed.
 *
 *   node --experimental-strip-types --import ./tests/unit/register.mjs scripts/migrate-gbp-to-redis.ts          # dry run
 *   node --experimental-strip-types --import ./tests/unit/register.mjs scripts/migrate-gbp-to-redis.ts --write  # write
 *
 * Reads NEXT_UPSTASH_REDIS_REST_URL / _TOKEN and NEXT_PUBLIC_STORE_KEY from the
 * environment, else from .env.local.
 */

import { readFileSync } from 'node:fs'
import { Redis } from '@upstash/redis'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { GBP_SHARED_DEFAULTS } from '@/lib/data/gbpShared'
import { GBP_TEMPLATE_DEFAULT } from '@/lib/data/gbpTemplate'
import { conformGbpPage, conformGbpShared, conformGbpTemplate } from '@/lib/gbpValidate'

const WRITE = process.argv.includes('--write')
const FORCE = process.argv.includes('--force')
const BY = 'migration (code seed)'

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name]
  try {
    const line = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${name}=`))
    return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
  } catch {
    return undefined
  }
}

const rawUrl = env('NEXT_UPSTASH_REDIS_REST_URL')
const token = env('NEXT_UPSTASH_REDIS_REST_TOKEN')
const store = env('NEXT_PUBLIC_STORE_KEY') || 'onsite'
if (!rawUrl || !token) throw new Error('Redis is not configured (NEXT_UPSTASH_REDIS_REST_URL / _TOKEN).')
const redis = new Redis({ url: /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`, token })

// Same shape as gbpKey() in services/gbp.service.ts (not imported: it pulls in next/cache).
const key = (kind: 'page' | 'shared' | 'template', id?: string) => ['oss-next', store, 'gbp', kind, ...(id ? [id] : [])].join(':')

const records: { key: string; data: unknown; label: string }[] = [
  ...GBP_PAGES.map((seed) => ({ key: key('page', seed.slug), data: conformGbpPage(structuredClone(seed), seed), label: seed.slug })),
  { key: key('shared'), data: conformGbpShared(structuredClone(GBP_SHARED_DEFAULTS), GBP_SHARED_DEFAULTS), label: 'shared content' },
  { key: key('template'), data: conformGbpTemplate(structuredClone(GBP_TEMPLATE_DEFAULT), GBP_TEMPLATE_DEFAULT), label: 'template' },
]

const host = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`).host
console.log(`${WRITE ? 'WRITING' : 'DRY RUN'} to ${host}, store "${store}": ${records.length} records`)

let written = 0
let skipped = 0
for (const record of records) {
  const exists = (await redis.exists(record.key)) === 1
  if (exists && !FORCE) {
    console.log(`  skip   ${record.key}  (already exists)`)
    skipped++
    continue
  }
  if (WRITE) {
    await redis.set(record.key, { data: record.data, updatedAt: new Date().toISOString(), updatedBy: BY })
    // Read it back: what the pages will render must be exactly the seed.
    const back = (await redis.get<{ data: unknown }>(record.key))?.data
    const same = JSON.stringify(back) === JSON.stringify(record.data)
    console.log(`  ${same ? 'wrote ' : 'MISMATCH'} ${record.key}`)
    if (!same) process.exitCode = 1
    written++
  } else {
    console.log(`  would write ${record.key}  (${record.label}, ${JSON.stringify(record.data).length} bytes)`)
  }
}
console.log(`${WRITE ? 'written' : 'would write'}: ${WRITE ? written : records.length - skipped}, skipped: ${skipped}`)
