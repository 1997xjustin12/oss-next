/**
 * Renders the security-remediation batches into a single PDF.
 *
 *   node scripts/security-report.mjs
 *
 * Reads every `docs/security_audit/batches/batch-*.json` and writes
 * `docs/security_audit/remediation-report.pdf`. Each batch file is the durable
 * record of one round of fixes — findings quoted as the scanner reported them,
 * plus what was actually done about each. Adding batch 2 means dropping in
 * `batch-2.json` and re-running this; nothing here needs editing.
 *
 * The PDF is written by hand rather than with a library, because none is
 * installed and a report generator is not worth a production dependency. It is
 * PDF 1.4 with the two base-14 Helvetica faces, which every reader has — so
 * there are no fonts to embed and the output stays a few tens of kilobytes.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BATCH_DIR = 'docs/security_audit/batches'
const OUT = 'docs/security_audit/remediation-report.pdf'

// ── page geometry ───────────────────────────────────────────────────────────
const W = 612, H = 792
const MARGIN = 54
const RIGHT = W - MARGIN
const BODY_W = RIGHT - MARGIN

/**
 * Helvetica advance widths, units per 1000. Needed to wrap text: without real
 * metrics a long advisory title silently runs off the page edge, which is the
 * one defect a report like this cannot afford.
 */
const WIDTHS = {
  ' ':278,'!':278,'"':355,'#':556,'$':556,'%':889,'&':667,"'":191,'(':333,')':333,'*':389,'+':584,
  ',':278,'-':333,'.':278,'/':278,'0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,
  '8':556,'9':556,':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,
  A:667,B:667,C:722,D:722,E:667,F:611,G:778,H:722,I:278,J:500,K:667,L:556,M:833,
  N:722,O:778,P:667,Q:778,R:722,S:667,T:611,U:722,V:667,W:944,X:667,Y:667,Z:611,
  '[':278,'\\':278,']':278,'^':469,'_':556,'`':333,
  a:556,b:556,c:500,d:556,e:556,f:278,g:556,h:556,i:222,j:222,k:500,l:222,m:833,
  n:556,o:556,p:556,q:556,r:333,s:500,t:278,u:556,v:500,w:722,x:500,y:500,z:500,
  '{':334,'|':260,'}':334,'~':584,
}

/** Bold runs ~6% wider than regular; close enough to wrap safely. */
function textWidth(str, size, bold) {
  let w = 0
  for (const ch of str) w += WIDTHS[ch] ?? 556
  return (w / 1000) * size * (bold ? 1.06 : 1)
}

function wrap(str, size, bold, maxWidth) {
  const out = []
  for (const paragraph of String(str).split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word
      if (textWidth(candidate, size, bold) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) out.push(line)
      // A single token longer than the column — a GHSA URL — is cut rather
      // than allowed to overflow.
      if (textWidth(word, size, bold) > maxWidth) {
        let chunk = ''
        for (const ch of word) {
          if (textWidth(chunk + ch, size, bold) > maxWidth) { out.push(chunk); chunk = '' }
          chunk += ch
        }
        line = chunk
      } else {
        line = word
      }
    }
    out.push(line)
  }
  return out
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

// Latin-1 is what WinAnsiEncoding gives us; anything outside it is transliterated
// rather than emitted raw, which would render as mojibake.
const latin1 = (s) =>
  String(s)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/—/g, '--').replace(/–/g, '-').replace(/•/g, '-')
    .replace(/·/g, '-').replace(/…/g, '...').replace(/→/g, '->')
    .replace(/[^\x20-\x7E]/g, '')

const RGB = {
  ink: [0.10, 0.10, 0.10],
  mid: [0.35, 0.35, 0.35],
  muted: [0.52, 0.52, 0.52],
  rule: [0.85, 0.85, 0.85],
  red: [0.74, 0.07, 0.16],
  green: [0.12, 0.54, 0.23],
  amber: [0.70, 0.44, 0.05],
}
const SEVERITY = { critical: RGB.red, high: RGB.red, moderate: RGB.amber, low: RGB.muted }

// ── writer ──────────────────────────────────────────────────────────────────
class Doc {
  constructor() { this.pages = []; this.newPage() }
  newPage() { this.ops = []; this.y = MARGIN + 8; this.pages.push(this.ops); }
  space(n) { this.y += n }
  room(n) { if (this.y + n > H - MARGIN - 22) this.newPage() }

  text(str, { size = 9.5, bold = false, colour = RGB.ink, indent = 0, lead = 1.42 } = {}) {
    const width = BODY_W - indent
    for (const line of wrap(latin1(str), size, bold, width)) {
      this.room(size * lead)
      this.ops.push(
        `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${colour.join(' ')} rg ` +
        `1 0 0 1 ${MARGIN + indent} ${H - this.y - size} Tm (${esc(line)}) Tj ET`,
      )
      this.y += size * lead
    }
  }

  /** Label left, value right on one line — used for the metadata block. */
  pair(label, value, { size = 9.5 } = {}) {
    this.room(size * 1.5)
    const y = H - this.y - size
    this.ops.push(`BT /F1 ${size} Tf ${RGB.muted.join(' ')} rg 1 0 0 1 ${MARGIN} ${y} Tm (${esc(latin1(label))}) Tj ET`)
    const v = latin1(value)
    this.ops.push(`BT /F2 ${size} Tf ${RGB.ink.join(' ')} rg 1 0 0 1 ${RIGHT - textWidth(v, size, true)} ${y} Tm (${esc(v)}) Tj ET`)
    this.y += size * 1.5
  }

  rule({ colour = RGB.rule, gap = 8 } = {}) {
    this.y += gap
    this.room(2)
    this.ops.push(`${colour.join(' ')} RG 0.6 w ${MARGIN} ${H - this.y} m ${RIGHT} ${H - this.y} l S`)
    this.y += gap
  }

  /** Severity chip plus package name, on one baseline. */
  chip(severity, right) {
    const size = 8
    this.room(20)
    const label = severity.toUpperCase()
    const w = textWidth(label, size, true) + 12
    const top = H - this.y - 11
    const colour = SEVERITY[severity] ?? RGB.muted
    this.ops.push(`${colour.join(' ')} rg ${MARGIN} ${top} ${w} 14 re f`)
    this.ops.push(`BT /F2 ${size} Tf 1 1 1 rg 1 0 0 1 ${MARGIN + 6} ${top + 4} Tm (${esc(label)}) Tj ET`)
    const r = latin1(right)
    this.ops.push(`BT /F2 10.5 Tf ${RGB.ink.join(' ')} rg 1 0 0 1 ${MARGIN + w + 9} ${top + 3} Tm (${esc(r)}) Tj ET`)
    this.y += 20
  }
}

// ── content ─────────────────────────────────────────────────────────────────
const batches = readdirSync(BATCH_DIR)
  .filter((f) => /^batch-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => JSON.parse(readFileSync(join(BATCH_DIR, f), 'utf8')))

if (batches.length === 0) throw new Error(`no batch files in ${BATCH_DIR}`)

const d = new Doc()

d.text('Security remediation report', { size: 21, bold: true })
d.space(2)
d.text('oss_pages storefront', { size: 11, colour: RGB.mid })
d.rule()

const latest = batches[batches.length - 1]
d.pair('Generated', new Date(latest.generated).toISOString().replace('T', ' ').slice(0, 16) + ' UTC')
/**
 * Rolled up by package, latest batch wins.
 *
 * Summing the batches would double-count anything deferred in one and fixed in
 * a later one — next, postcss and sharp appear in both — and would report three
 * findings still outstanding when none are. The per-batch sections below still
 * show each batch's own before/after, which is where the history lives.
 */
const current = new Map()
for (const b of batches) for (const f of b.findings) current.set(f.package, f.status)
const outstanding = [...current.values()].filter((s) => s !== 'FIXED').length

d.pair('Batches in this report', batches.map((b) => `#${b.batch}`).join(', '))
d.pair('Distinct findings', String(current.size))
d.pair('Fixed', String(current.size - outstanding))
d.pair('Still outstanding', String(outstanding))

d.rule()
d.text('Provenance', { size: 13, bold: true })
d.space(3)
d.text(
  'This report does not follow docs/security_audit/secsuite-run-40.pdf. That scan was run against a ' +
  'different codebase: every file it cites is rooted at /Users/johndenvercontaoi/Documents/OSS/frontend/, ' +
  'it reports next 15.0.3 against a pnpm-lock.yaml, and it flags packages (js-cookie, searchkit) and ' +
  'directories (src/, the menu-builder admin, the bbq-design and oko-design component sets) that do not ' +
  'exist in this repository. Its 22 semgrep and 3 gitleaks findings name source files that are not here, ' +
  'so applying them was not possible and reproducing them as if they were would have made this document ' +
  'wrong.',
  { colour: RGB.mid },
)
d.space(5)
d.text(
  'The findings below come from npm audit run against this repository instead, which is the same class of ' +
  'check (dependency CVEs) against the right target. Two items from the original report do still warrant ' +
  'action wherever they live, and are recorded at the end.',
  { colour: RGB.mid },
)

for (const batch of batches) {
  d.rule({ gap: 14 })
  d.text(`Batch ${batch.batch} — ${batch.title}`, { size: 15, bold: true })
  d.space(4)
  d.text(`Source: ${batch.source.tool}`, { size: 9, colour: RGB.muted })
  d.space(6)

  const t = batch.totals
  d.text(
    `Before: ${t.before.total} vulnerabilities (${t.before.critical} critical, ${t.before.high} high, ` +
    `${t.before.moderate} moderate, ${t.before.low} low).   ` +
    `After: ${t.after.total} (${t.after.critical} critical, ${t.after.high} high, ` +
    `${t.after.moderate} moderate, ${t.after.low} low).`,
    { bold: true },
  )

  // A dependency bump that nobody checked is a claim, not a fix. Where a batch
  // records how it was verified, the report carries it — that is the part a
  // reader needs in six months when something breaks and they are working out
  // whether this was to blame.
  if (batch.verification?.length) {
    d.space(8)
    d.text('Verification', { size: 10, bold: true, colour: RGB.mid })
    d.space(3)
    for (const v of batch.verification) {
      d.text(`•  ${v}`, { size: 9, colour: RGB.ink, indent: 8 })
      d.space(1)
    }
  }

  for (const f of batch.findings) {
    d.rule({ gap: 11 })
    d.chip(f.severity, `${f.package}   ${f.range}`)

    d.text(
      `${f.direct ? 'Direct dependency' : 'Transitive dependency'}` +
      (f.versionBefore ? `   ·   installed: ${f.versionBefore}` : ''),
      { size: 8.5, colour: RGB.muted },
    )
    d.space(4)

    d.text('Reported', { size: 9, bold: true, colour: RGB.mid })
    d.space(2)
    for (const a of f.advisories) {
      d.text(`•  ${a.title}`, { size: 9, colour: RGB.ink, indent: 8 })
      d.text(`${a.cwe ? a.cwe + '   ·   ' : ''}${a.url}`, { size: 8, colour: RGB.muted, indent: 18 })
      d.space(2)
    }

    d.space(3)
    d.text(f.status === 'FIXED' ? 'Fixed' : 'Deferred', {
      size: 9, bold: true, colour: f.status === 'FIXED' ? RGB.green : RGB.amber,
    })
    d.space(2)
    d.text(f.fix, { size: 9, colour: RGB.ink, indent: 8 })
    if (f.status === 'FIXED' && f.versionAfter) {
      d.space(2)
      d.text(`Now installed: ${f.versionAfter}`, { size: 8.5, colour: RGB.muted, indent: 8 })
    }
  }
}

d.rule({ gap: 14 })
d.text('Carried over from secsuite-run-40.pdf', { size: 13, bold: true })
d.space(4)
d.text(
  'Two findings in that report are credentials committed to source. The files are not in this repository, ' +
  'but a leaked key is leaked wherever it was committed, and deleting the line does not help because it ' +
  'remains in git history. Both need rotating at the provider, and this repository depends on braintree ' +
  '(^3.38.0), so if that gateway is shared the exposure reaches this app too.',
  { colour: RGB.mid },
)
d.space(6)
d.text('•  Braintree private key — src/app/lib/braintree.js:7', { size: 9, indent: 8 })
d.text('•  Elasticsearch API key — src/pages/api/es/searchkit.js:8 and :43', { size: 9, indent: 8 })
d.space(6)
d.text('Reported fix, verbatim: "Rotate the credential, remove it from source, and load from a secret manager."',
  { size: 9, colour: RGB.muted, indent: 8 })

// ── assemble ────────────────────────────────────────────────────────────────
const objects = []
const add = (body) => { objects.push(body); return objects.length }

const fontRegular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
const fontBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

// Each page costs two objects (content stream + page); the Pages node follows
// them. Predicted rather than patched afterwards because every /Page has to
// name its parent, and the assertion below catches the arithmetic drifting.
const pagesId = objects.length + d.pages.length * 2 + 1
const pageIds = []
d.pages.forEach((ops, i) => {
  const footer =
    `BT /F1 8 Tf ${RGB.muted.join(' ')} rg 1 0 0 1 ${MARGIN} ${MARGIN - 16} Tm ` +
    `(${esc(`oss_pages security remediation  -  page ${i + 1} of ${d.pages.length}`)}) Tj ET`
  const stream = ops.concat(footer).join('\n')
  const contentId = add(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`)
  pageIds.push(add(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] ` +
    `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`,
  ))
})
const pagesObj = add(`<< /Type /Pages /Kids [${pageIds.map((i) => `${i} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
if (pagesObj !== pagesId) throw new Error(`pages id drifted: predicted ${pagesId}, got ${pagesObj}`)
const catalog = add(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`)

let pdf = '%PDF-1.4\n'
const offsets = [0]
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, 'latin1'))
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
})
const xref = Buffer.byteLength(pdf, 'latin1')
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`

writeFileSync(OUT, Buffer.from(pdf, 'latin1'))
console.log(`${OUT} — ${d.pages.length} pages, ${(Buffer.byteLength(pdf, 'latin1') / 1024).toFixed(1)} KB`)
