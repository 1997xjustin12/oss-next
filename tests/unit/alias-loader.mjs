// Module resolve hook for the unit tests: maps the `@/…` path aliases from
// tsconfig.json to files, and adds the `.ts` / `.tsx` extension Node does not
// guess. Registered by tests/unit/register.mjs; see package.json "test:unit".
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = new URL('../../', import.meta.url)
const EXTENSIONS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']

function findFile(baseUrl) {
  const [path, query] = baseUrl.href.split('?')
  for (const ext of EXTENSIONS) {
    const file = fileURLToPath(path + ext)
    if (existsSync(file) && statSync(file).isFile()) return pathToFileURL(file).href + (query ? `?${query}` : '')
  }
  return null
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const found = findFile(new URL(specifier.slice(2), ROOT))
    if (found) return { url: found, shortCircuit: true }
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    const found = findFile(new URL(specifier, context.parentURL))
    if (found) return { url: found, shortCircuit: true }
  }
  try {
    return await next(specifier, context)
  } catch (err) {
    // Packages without an exports map (next/cache, next/server) need the
    // extension under ESM resolution; webpack and Turbopack add it themselves.
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && /^[^./][^:]*\/[^.]+$/.test(specifier)) {
      return next(`${specifier}.js`, context)
    }
    throw err
  }
}
