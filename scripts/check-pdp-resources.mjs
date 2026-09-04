/**
 * Reports which spec combinations have files, and which files nothing reaches.
 *
 * A misspelt filename hides a resource button silently — no error, no 404, the
 * button simply is not there. This is how you find out before a customer does.
 *
 * Reads the vocabulary from `lib/containerSpecTerms.ts` rather than repeating
 * it, so the names checked here are the names the app asks for.
 */
import { execFileSync } from 'node:child_process'

execFileSync(process.execPath, ['scripts/generate-pdp-resources.mjs'], { stdio: 'inherit' })

const { PDP_RESOURCE_FILES } = await import('../lib/data/pdpResourceManifest.ts')
const { CONTAINER_VARIANTS, SIZE_TERMS, OFFERED_PAIRS, sizeSlug, specFileStem } =
  await import('../lib/containerSpecTerms.ts')

const IMG = ['webp', 'png', 'jpg', 'jpeg']

const find = (stem, exts) =>
  exts.map((e) => `${stem}.${e}`).find((f) => PDP_RESOURCE_FILES.includes(f)) ?? null

const reached = new Set()
const mark = (f) => (f && reached.add(f), f)
const tick = (f) => (f ? `ok  ${f}` : 'MISSING')

let have = 0
let want = 0
const row = (name, file) => {
  want += 1
  if (file) have += 1
  console.log(`  ${name.padEnd(30)} ${tick(file)}`)
}

console.log('\n— dimensions (per size) —')
for (const size of CONTAINER_VARIANTS) {
  row(SIZE_TERMS[size].label, mark(find(`${sizeSlug(size)}_dimension`, ['pdf'])))
}

for (const [heading, exts] of [
  ['what to expect (image)', IMG],
  ['complete guide (pdf)', ['pdf']],
]) {
  console.log(`\n— ${heading} — per size x stocked combination —`)
  for (const size of CONTAINER_VARIANTS) {
    for (const [condition, grade] of OFFERED_PAIRS) {
      const stem = specFileStem(size, condition, grade)
      row(stem, mark(find(stem, exts)))
    }
  }
}

const orphans = PDP_RESOURCE_FILES.filter((f) => !reached.has(f))
console.log(`\n${have}/${want} resources present.`)
console.log(`unreachable files: ${orphans.length || 'none'}`)
for (const f of orphans) console.log(`  ${f}  <- no product resolves this name`)
console.log()
