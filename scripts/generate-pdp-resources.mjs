/**
 * Records which PDP resource files actually exist.
 *
 * The resources row derives a filename from the active product's size,
 * condition and grade — but the component that renders it is a Client
 * Component, and a browser cannot stat a directory. So the directory listing is
 * captured here at build time and shipped as data.
 *
 * Run it whenever a file is added, removed or renamed under
 * `public/resources/pdp/`. `predev` and `prebuild` do that automatically, so in
 * practice dropping a correctly-named file in is the whole workflow.
 */

import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'resources', 'pdp')
const out = join(root, 'lib', 'data', 'pdpResourceManifest.ts')

const files = existsSync(dir)
  ? readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort()
  : []

const body = `// GENERATED FILE — do not edit by hand.
// Run \`npm run resources:manifest\` (or any \`npm run dev\`/\`build\`) to refresh.
// Source: public/resources/pdp/

/** Every file present under \`public/resources/pdp/\`, as bare filenames. */
export const PDP_RESOURCE_FILES: readonly string[] = [
${files.map((f) => `  '${f}',`).join('\n')}
]
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, body, 'utf8')
console.log(`pdp resources: ${files.length} file(s) -> lib/data/pdpResourceManifest.ts`)
