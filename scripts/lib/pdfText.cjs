/**
 * Reads the text back out of a PDF this repo generated.
 *
 * Verification only — it understands uncompressed content streams and nothing
 * else, which is all `scripts/lib/pdf.mjs` produces. Used to prove a generated
 * report actually contains what it should, and that a refactor of the writer
 * did not change the output.
 */
const fs = require("fs");

function extract(file) {
  const raw = fs.readFileSync(file).toString("latin1");
  const unesc = (s) => s.replace(/\\([()\\])/g, "$1");
  const pages = [];
  let i = 0;
  while (true) {
    const s = raw.indexOf("stream\n", i);
    if (s === -1) break;
    const e = raw.indexOf("\nendstream", s);
    if (e === -1) break;
    const lines = [...raw.slice(s + 7, e).matchAll(/\((?:\\.|[^\\()])*\)\s*Tj/g)].map((m) =>
      unesc(m[0].replace(/\s*Tj$/, "").slice(1, -1)),
    );
    if (lines.length) pages.push(lines);
    i = e + 10;
  }
  return pages;
}

module.exports = { extract };

if (require.main === module) {
  const pages = extract(process.argv[2]);
  console.error(`pages: ${pages.length}  lines: ${pages.flat().length}`);
  process.stdout.write(pages.map((p, n) => `--- page ${n + 1} ---\n${p.join("\n")}`).join("\n\n"));
}
