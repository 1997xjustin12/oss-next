/**
 * A minimal PDF writer for the reports in `docs/`.
 *
 * Written by hand because no PDF library is installed and a report generator is
 * not worth a production dependency. It emits PDF 1.4 using the two base-14
 * Helvetica faces, which every reader already has — so no fonts are embedded
 * and the output stays a few tens of kilobytes.
 *
 * Shared by scripts/security-report.mjs and scripts/changelog-report.mjs.
 */

import { writeFileSync } from 'node:fs'

export const W = 612
export const H = 792
export const MARGIN = 54
const RIGHT = W - MARGIN
const BODY_W = RIGHT - MARGIN

/**
 * Helvetica advance widths, units per 1000.
 *
 * Needed to wrap text: without real metrics a long line silently runs off the
 * page edge, which is the one defect a report cannot afford.
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
export function textWidth(str, size, bold) {
  let w = 0
  for (const ch of str) w += WIDTHS[ch] ?? 556
  return (w / 1000) * size * (bold ? 1.06 : 1)
}

export function wrap(str, size, bold, maxWidth) {
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
      // A single token longer than the column — a URL — is cut rather than
      // allowed to overflow.
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

/**
 * WinAnsiEncoding is Latin-1; anything outside it is transliterated rather than
 * emitted raw, which would render as mojibake. Commit messages are full of
 * em-dashes and curly quotes, so this matters more than it looks.
 */
export const latin1 = (s) =>
  String(s)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/—/g, '--').replace(/–/g, '-').replace(/•/g, '-')
    .replace(/·/g, '-').replace(/…/g, '...').replace(/→/g, '->')
    .replace(/[≤]/g, '<=').replace(/[≥]/g, '>=')
    .replace(/[^\x20-\x7E]/g, '')

export const RGB = {
  ink: [0.10, 0.10, 0.10],
  mid: [0.35, 0.35, 0.35],
  muted: [0.52, 0.52, 0.52],
  rule: [0.85, 0.85, 0.85],
  red: [0.74, 0.07, 0.16],
  green: [0.12, 0.54, 0.23],
  amber: [0.70, 0.44, 0.05],
  navy: [0.06, 0.23, 0.36],
}

export class Doc {
  constructor() { this.pages = []; this.newPage() }
  newPage() { this.ops = []; this.y = MARGIN + 8; this.pages.push(this.ops) }
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

  /** Label left, value right on one line. */
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

  /** A filled chip, plus a heading on the same baseline. */
  chip(label, right, { colour = RGB.muted, size = 8 } = {}) {
    this.room(20)
    const text = String(label).toUpperCase()
    const w = textWidth(text, size, true) + 12
    const top = H - this.y - 11
    this.ops.push(`${colour.join(' ')} rg ${MARGIN} ${top} ${w} 14 re f`)
    this.ops.push(`BT /F2 ${size} Tf 1 1 1 rg 1 0 0 1 ${MARGIN + 6} ${top + 4} Tm (${esc(latin1(text))}) Tj ET`)
    const r = latin1(right)
    this.ops.push(`BT /F2 10.5 Tf ${RGB.ink.join(' ')} rg 1 0 0 1 ${MARGIN + w + 9} ${top + 3} Tm (${esc(r)}) Tj ET`)
    this.y += 20
  }
}

/** Serialises the document and writes it. Returns the byte length. */
export function writePdf(doc, out, footerLabel) {
  const objects = []
  const add = (body) => { objects.push(body); return objects.length }

  const fontRegular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const fontBold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

  // Each page costs two objects (content stream + page); the Pages node follows
  // them. Predicted rather than patched afterwards because every /Page names its
  // parent — the assertion below catches the arithmetic drifting.
  const pagesId = objects.length + doc.pages.length * 2 + 1
  const pageIds = []

  doc.pages.forEach((ops, i) => {
    const footer =
      `BT /F1 8 Tf ${RGB.muted.join(' ')} rg 1 0 0 1 ${MARGIN} ${MARGIN - 16} Tm ` +
      `(${esc(latin1(`${footerLabel}  -  page ${i + 1} of ${doc.pages.length}`))}) Tj ET`
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

  const buf = Buffer.from(pdf, 'latin1')
  writeFileSync(out, buf)
  return buf.length
}
