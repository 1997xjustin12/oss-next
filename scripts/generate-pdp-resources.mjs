/**
 * Records which PDP resource and walkaround-video files actually exist.
 *
 * The resources row derives a filename from the active product's size,
 * condition and grade, and the gallery derives a video filename the same way —
 * but the components that render them are Client Components, and a browser
 * cannot stat a directory. On a serverless deploy the server cannot be relied
 * on to either: `public/` is served by the CDN and is not guaranteed to be on
 * the lambda's disk. So the directory listings are captured here at build time
 * and shipped as data.
 *
 * Run it whenever a file is added, removed or renamed under
 * `public/resources/pdp/` or `public/resources/pdp-videos/`. `predev` and `prebuild`
 * do that automatically, so in practice dropping a correctly-named file in is
 * the whole workflow.
 */

import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Bare filenames in a public directory, sorted. Dotfiles and READMEs are not assets. */
function listFiles(...segments) {
  const dir = join(root, 'public', ...segments)
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.') && e.name !== 'README.md')
    .map((e) => e.name)
    .sort()
}

function writeManifest({ outPath, source, exportName, docLine, files }) {
  const out = join(root, ...outPath)
  const lines = files.map((f) => `  '${f}',`).join('\n')

  const body = [
    '// GENERATED FILE — do not edit by hand.',
    '// Run `npm run resources:manifest` (or any `npm run dev`/`build`) to refresh.',
    `// Source: ${source}`,
    '',
    `/** ${docLine} */`,
    `export const ${exportName}: readonly string[] = [`,
    lines,
    ']',
    '',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n')

  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, body, 'utf8')
  console.log(`${source}: ${files.length} file(s) -> ${outPath.join('/')}`)
}

writeManifest({
  outPath: ['lib', 'data', 'pdpResourceManifest.ts'],
  source: 'public/resources/pdp/',
  exportName: 'PDP_RESOURCE_FILES',
  docLine: 'Every file present under `public/resources/pdp/`, as bare filenames.',
  files: listFiles('resources', 'pdp'),
})

// Walkaround videos, named by spec stem — see config/containerVideos.ts. The
// gallery has to know whether one exists before it renders, so that a product
// without one shows its photographs and no empty player.
writeManifest({
  outPath: ['lib', 'data', 'containerVideoManifest.ts'],
  source: 'public/resources/pdp-videos/',
  exportName: 'CONTAINER_VIDEO_FILES',
  docLine: 'Every file present under `public/resources/pdp-videos/`, as bare filenames.',
  files: listFiles('resources', 'pdp-videos'),
})
