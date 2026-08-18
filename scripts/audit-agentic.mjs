#!/usr/bin/env node
/**
 * Agentic-readiness audit. Run against a running server:
 *
 *   npm run audit:agentic                      # defaults to http://localhost:3000
 *   npm run audit:agentic -- --base https://…  # or a deployed environment
 *   npm run audit:agentic -- --skip-links      # faster; skips the llms.txt sweep
 *
 * Exits non-zero on any failure, so it can gate CI.
 *
 * What it checks, and why each one is here rather than trusted:
 *
 *   1. JSON-LD parses and carries the node types each page type promises.
 *      Schema is built in code and never rendered visually, so a broken builder
 *      is invisible until a crawler silently drops the page.
 *   2. No JSON-LD block contains a raw `</script>`. JSON.stringify does not
 *      escape `<`, so one product title could otherwise break out of the tag.
 *   3. Exactly one <h1> and exactly one <main> per page.
 *   4. Every link in llms.txt resolves — including SOFT 404s, which is the
 *      whole point: this codebase served "Not Found" with HTTP 200, so a
 *      status-code-only check reports a perfect score on a broken site.
 *   5. robots.txt names the crawlers config/crawlers.ts claims to name.
 *   6. The Markdown representation works via both suffix and content negotiation.
 */

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const has = (name) => args.includes(`--${name}`)

const BASE = (flag('base', process.env.AUDIT_BASE_URL || 'http://localhost:3000')).replace(/\/+$/, '')
const SKIP_LINKS = has('skip-links')
const TIMEOUT = Number(flag('timeout', '300000'))

let failures = 0
let checks = 0

const ok = (msg) => { checks++; console.log(`  ok    ${msg}`) }
const fail = (msg) => { checks++; failures++; console.log(`  FAIL  ${msg}`) }
const section = (msg) => console.log(`\n${msg}`)

async function get(path, headers) {
  const res = await fetch(BASE + path, { headers, redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT) })
  return { status: res.status, headers: res.headers, body: await res.text() }
}

/** A page is "missing" if it 404s OR renders the Not Found page with any status. */
function isMissing({ status, body }) {
  return status === 404 || /<title>[^<]*Not Found/i.test(body)
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
}

function collectTypes(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) { node.forEach((n) => collectTypes(n, out)); return out }
  if (node['@type']) out.push(...[node['@type']].flat())
  if (Array.isArray(node['@graph'])) node['@graph'].forEach((n) => collectTypes(n, out))
  for (const v of Object.values(node)) if (v && typeof v === 'object') collectTypes(v, out)
  return out
}

function count(html, tag) {
  return (html.match(new RegExp(`<${tag}(?=[\\s>])`, 'gi')) || []).length
}

async function checkPage(path, expectedTypes) {
  const res = await get(path)
  if (res.status !== 200) return fail(`${path} returned ${res.status}`)

  const blocks = jsonLdBlocks(res.body)
  if (!blocks.length) return fail(`${path} has no JSON-LD`)

  const types = []
  for (const raw of blocks) {
    if (/<\/script/i.test(raw)) fail(`${path} JSON-LD contains a raw </script>`)
    try {
      types.push(...collectTypes(JSON.parse(raw)))
    } catch (e) {
      return fail(`${path} JSON-LD does not parse: ${e.message}`)
    }
  }

  const missing = expectedTypes.filter((t) => !types.includes(t))
  if (missing.length) fail(`${path} JSON-LD missing ${missing.join(', ')} (found: ${[...new Set(types)].join(', ')})`)
  else ok(`${path} JSON-LD: ${expectedTypes.join(', ')}`)

  const h1s = count(res.body, 'h1')
  if (h1s !== 1) fail(`${path} has ${h1s} <h1> (want exactly 1)`)
  else ok(`${path} has exactly one <h1>`)

  const mains = count(res.body, 'main')
  if (mains !== 1) fail(`${path} has ${mains} <main> (want exactly 1)`)
}

async function discover() {
  // Real slugs, so the audit exercises live data rather than fixtures.
  const out = { product: null, wpPage: null, depot: null }
  try {
    const r = await get('/api/sitemap?type=products')
    out.product = JSON.parse(r.body).products?.[0]?.handle ?? null
  } catch {}
  try {
    const r = await get('/api/sitemap?type=page')
    const paths = (JSON.parse(r.body).pages ?? [])
      .map((p) => p.path)
      .filter(Boolean)
      // The backend's page list includes "/" — the homepage, which is a native
      // route with its own expectations (no breadcrumb) and no ".md" form.
      // Picking it as the "WordPress page" made this script test the wrong page
      // and then build the URL "http://host.md".
      .filter((p) => p.replace(/\/+$/, '').length > 1)
    out.wpPage = paths.find((p) => p.replace(/^\/|\/$/g, '').split('/').length === 1) ?? null
    out.depot = paths.find((p) => p.startsWith('/where-to-buy-shipping-containers/')) ?? null
  } catch {}
  return out
}

async function checkLinks() {
  const res = await get('/llms.txt')
  if (res.status !== 200) return fail(`/llms.txt returned ${res.status}`)

  const urls = [...new Set([...res.body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]))]

  // An empty link set is a FAILURE, not a pass. This check originally reported
  // "all 0 links resolve" while /llms.txt was 404ing — a green tick on a broken
  // file. Any check that can pass vacuously will eventually do so at the worst
  // possible moment.
  const MIN_EXPECTED_LINKS = 20
  if (urls.length < MIN_EXPECTED_LINKS) {
    return fail(`/llms.txt yielded only ${urls.length} links (expected at least ${MIN_EXPECTED_LINKS})`)
  }

  const origin = new URL(BASE).origin

  const broken = []
  const queue = urls.map((u) => u.replace(/^https?:\/\/[^/]+/, origin))

  /**
   * Retried once before being called broken.
   *
   * The WordPress pages API is intermittently slow, and `fetchWpPage` turns a
   * fetch failure into notFound() — so one blip renders a real page as "Not
   * Found". Failing the whole audit on a single transient is how a check
   * becomes something people routinely override, at which point it protects
   * nothing. A URL that fails twice in a row is a real problem.
   */
  async function probe(url) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
        const bodyText = await res.text()
        if (!isMissing({ status: res.status, body: bodyText })) return null
        if (attempt === 0) continue
        return `${res.status === 404 ? '404' : 'SOFT-404'} ${url}`
      } catch (e) {
        if (attempt === 1) return `ERR ${url} ${e.message}`
      }
    }
    return null
  }

  const workers = Array.from({ length: 6 }, async () => {
    for (;;) {
      const url = queue.shift()
      if (!url) return
      const result = await probe(url)
      if (result) broken.push(result)
    }
  })
  await Promise.all(workers)

  if (broken.length) {
    fail(`llms.txt: ${broken.length}/${urls.length} links broken`)
    broken.slice(0, 15).forEach((b) => console.log(`        ${b}`))
  } else {
    ok(`llms.txt: all ${urls.length} links resolve`)
  }
}

;(async () => {
  console.log(`Agentic readiness audit against ${BASE}`)
  const { product, wpPage, depot } = await discover()

  section('Structured data, headings, landmarks')
  await checkPage('/', ['Organization', 'WebSite', 'WebPage'])
  await checkPage('/sale-shipping-containers', ['Organization', 'BreadcrumbList', 'ItemList'])
  if (product) await checkPage(`/product/${product}`, ['Product', 'BreadcrumbList', 'FAQPage'])
  else fail('could not discover a product handle to test')
  if (wpPage) await checkPage(wpPage, ['Organization', 'WebPage', 'BreadcrumbList'])
  else fail('could not discover a WordPress page to test')
  if (depot) await checkPage(depot, ['LocalBusiness'])

  section('SearchAction target actually works')
  {
    const home = await get('/')
    const m = home.body.match(/"urlTemplate":"([^"]+)"/)
    if (!m) fail('no SearchAction urlTemplate on the homepage')
    else {
      const probe = m[1].replace(/^https?:\/\/[^/]+/, '').replace('{search_term_string}', 'high+cube')
      const res = await get(probe)
      if (isMissing(res)) fail(`SearchAction target does not resolve: ${probe}`)
      else ok(`SearchAction target resolves: ${probe}`)
    }
  }

  section('Markdown representation')
  for (const [label, path, headers] of [
    ['suffix', wpPage ? `${wpPage.replace(/\/$/, '')}.md` : '/privacy-policy.md', undefined],
    ['negotiation', wpPage ?? '/privacy-policy', { Accept: 'text/markdown' }],
  ]) {
    const res = await get(path, headers)
    if (res.status !== 200) fail(`Markdown via ${label} returned ${res.status} for ${path}`)
    else if (!/^---/.test(res.body.trim())) fail(`Markdown via ${label} has no front matter`)
    else ok(`Markdown via ${label}`)
  }
  {
    // Private pages must NOT expose a Markdown view.
    const res = await get('/cart.md')
    if (res.status === 404) ok('/cart.md correctly 404s')
    else fail(`/cart.md returned ${res.status}, expected 404`)
  }

  section('Missing pages return a real 404')
  {
    const res = await get('/definitely-not-a-real-page-xyz')
    if (res.status === 404) ok('unknown WordPress path returns 404')
    else fail(`unknown path returned ${res.status} — soft 404 regression`)
  }

  section('Machine-readable routes still reachable')
  {
    // Regression guard. The proxy 404s any non-native path absent from the
    // backend page list, and these are route handlers that list knows nothing
    // about — which is exactly how /llms.txt got 404'd once already.
    for (const path of ['/llms.txt', '/llms-full.txt', '/robots.txt', '/sitemap.xml', '/api/sitemap?type=page']) {
      const res = await get(path)
      if (res.status === 200) ok(`${path} reachable`)
      else fail(`${path} returned ${res.status}`)
    }
  }

  section('Agent API')
  {
    const spec = await get('/openapi.json')
    if (spec.status !== 200) fail(`/openapi.json returned ${spec.status}`)
    else {
      try {
        const doc = JSON.parse(spec.body)
        const paths = Object.keys(doc.paths ?? {})
        if (!doc.openapi?.startsWith('3.')) fail(`/openapi.json is not OpenAPI 3.x`)
        else if (paths.length < 3) fail(`/openapi.json documents only ${paths.length} paths`)
        else ok(`/openapi.json documents ${paths.length} operations`)

        // Every documented path must actually respond. A spec that describes
        // routes that don't exist is worse than no spec: an agent will trust it.
        for (const p of paths) {
          const probe = p.replace('{handle}', 'probe-handle-that-does-not-exist')
          const sample = probe.includes('availability') ? `${probe}?zip=85001` : probe
          const res = await get(sample)
          // 404 is fine for the deliberately-bogus handle; anything 5xx is not.
          if (res.status >= 500) fail(`documented path ${p} returned ${res.status}`)
          else ok(`documented path ${p} responds (${res.status})`)
        }
      } catch (e) {
        fail(`/openapi.json does not parse: ${e.message}`)
      }
    }

    const search = await get('/api/agent/v1/search?q=40ft&limit=3')
    if (search.status !== 200) fail(`agent search returned ${search.status}`)
    else {
      const data = JSON.parse(search.body)
      if (!Array.isArray(data.products)) fail('agent search returned no products array')
      else if (data.products.length === 0) fail('agent search returned zero products for "40ft"')
      else {
        ok(`agent search returned ${data.products.length} products`)
        // The single most misreadable field in this catalog. Every product must
        // state its basis and carry a quotable sentence — a bare number here is
        // how an assistant ends up quoting a monthly rate as a purchase price.
        const bad = data.products.filter(
          (p) => !p.price || !['one-time', 'monthly'].includes(p.price.basis) || !p.price.description,
        )
        if (bad.length) fail(`${bad.length} product(s) missing price.basis/description`)
        else ok('every product states its price basis and description')
      }
    }

    const avail = await get('/api/agent/v1/availability?zip=85001')
    if (avail.status !== 200) fail(`availability returned ${avail.status}`)
    else {
      const data = JSON.parse(avail.body)
      if (!data.depot?.name) fail('availability returned no depot for 85001')
      else ok(`availability resolves 85001 -> ${data.depot.name} (${data.depot.distanceMiles} mi)`)
    }

    // Errors must be actionable, not bare status codes.
    const badReq = await get('/api/agent/v1/availability')
    if (badReq.status !== 400) fail(`availability without zip returned ${badReq.status}, expected 400`)
    else {
      const data = JSON.parse(badReq.body)
      if (!data.error?.code || !data.error?.hint) fail('error response lacks code/hint')
      else ok(`errors carry code + hint (${data.error.code})`)
    }

    const limited = await get('/api/agent/v1/search?limit=1')
    if (limited.headers.get('x-ratelimit-limit')) ok('rate limit headers present')
    else fail('no X-RateLimit-Limit header on the agent API')
  }

  section('MCP server')
  {
    let rpcId = 0
    const rpc = async (method, params, extraHeaders = {}) => {
      const res = await fetch(`${BASE}/api/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          'MCP-Protocol-Version': '2025-06-18',
          ...extraHeaders,
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, ...(params ? { params } : {}) }),
        signal: AbortSignal.timeout(TIMEOUT),
      })
      const text = await res.text()
      let body = null
      try { body = text ? JSON.parse(text) : null } catch {}
      return { status: res.status, body, text }
    }

    const init = await rpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'audit', version: '1.0.0' },
    })
    if (init.body?.result?.serverInfo?.name && init.body.result.capabilities?.tools) {
      ok(`MCP initialize -> ${init.body.result.serverInfo.name} @ ${init.body.result.protocolVersion}`)
    } else {
      fail(`MCP initialize failed: ${JSON.stringify(init.body)?.slice(0, 160)}`)
    }

    // Spec § Sending Messages (4): a POST carrying only a notification MUST get
    // 202 with an empty body. Easy to regress into returning `{}` with a 200.
    const notif = await fetch(`${BASE}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    const notifBody = await notif.text()
    if (notif.status === 202 && !notifBody.length) ok('MCP notification -> 202 with empty body')
    else fail(`MCP notification returned ${notif.status} with ${notifBody.length} bytes (spec: 202, empty)`)

    // Spec § Listening (3): 405 when no SSE stream is offered.
    const getRes = await fetch(`${BASE}/api/mcp`, { headers: { Accept: 'text/event-stream' }, signal: AbortSignal.timeout(TIMEOUT) })
    await getRes.text()
    if (getRes.status === 405) ok('MCP GET -> 405 (stateless, no SSE)')
    else fail(`MCP GET returned ${getRes.status}, expected 405`)

    const list = await rpc('tools/list')
    const tools = list.body?.result?.tools ?? []
    const expected = ['search_containers', 'get_product', 'check_delivery', 'get_page_content']
    const missingTools = expected.filter((n) => !tools.some((t) => t.name === n))
    if (missingTools.length) fail(`MCP tools/list missing: ${missingTools.join(', ')}`)
    else ok(`MCP tools/list -> ${tools.length} tools`)

    // Tool descriptions are prompts — a thin one is a real defect.
    const thin = tools.filter((t) => !t.description || t.description.length < 80)
    if (thin.length) fail(`MCP tools with thin descriptions: ${thin.map((t) => t.name).join(', ')}`)
    else if (tools.length) ok('every MCP tool has a substantive description')

    // Unknown tool must be a protocol error, not an isError result.
    const unknown = await rpc('tools/call', { name: 'not_a_tool', arguments: {} })
    if (unknown.body?.error?.code === -32602) ok('MCP unknown tool -> JSON-RPC error')
    else fail(`MCP unknown tool returned ${JSON.stringify(unknown.body)?.slice(0, 160)}`)

    const call = await rpc('tools/call', { name: 'check_delivery', arguments: { zip: '85001' } })
    const depot = call.body?.result?.structuredContent?.depot
    if (depot?.name) ok(`MCP check_delivery -> ${depot.name}`)
    else fail(`MCP check_delivery failed: ${JSON.stringify(call.body)?.slice(0, 160)}`)

    // A bad argument is an execution failure, not a protocol error.
    const badArg = await rpc('tools/call', { name: 'check_delivery', arguments: { zip: 'ZZZZZ' } })
    if (badArg.body?.result?.isError === true) ok('MCP bad argument -> isError result')
    else fail(`MCP bad argument returned ${JSON.stringify(badArg.body)?.slice(0, 160)}`)
  }

  section('robots.txt')
  {
    const { body } = await get('/robots.txt')
    for (const ua of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot']) {
      if (body.includes(ua)) ok(`robots.txt names ${ua}`)
      else fail(`robots.txt does not name ${ua}`)
    }
    if (/Sitemap:/i.test(body)) ok('robots.txt declares a sitemap')
    else fail('robots.txt has no Sitemap line')
  }

  if (!SKIP_LINKS) {
    section('llms.txt link health')
    await checkLinks()
  }

  console.log(`\n${checks - failures}/${checks} checks passed`)
  process.exit(failures ? 1 : 0)
})().catch((e) => {
  console.error('audit crashed:', e)
  process.exit(1)
})
