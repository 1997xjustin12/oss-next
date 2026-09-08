/**
 * Scans staged changes for credentials. Run by .githooks/pre-commit.
 *
 * Deliberately node rather than gitleaks: a hook that needs a binary installed
 * is a hook that silently does nothing on the machine that skips the install,
 * and that machine is the one that commits the key. Node is already required to
 * work on this repo. The CI workflow runs real gitleaks over full history as
 * the backstop; this is the fast local net.
 *
 * Only *added* lines are scanned. Reformatting a file that already contains a
 * flagged string should not block a commit that did not introduce it.
 */

import { execFileSync } from 'node:child_process'

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

/**
 * Files whose contents legitimately look like secrets.
 *
 * Lockfiles are the important one: every integrity hash is a long base64 blob
 * next to a key-ish name, so scanning them is pure noise.
 */
const SKIP = [
  /(^|\/)package-lock\.json$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)yarn\.lock$/,
  /\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|mp4|zip)$/i,
]

/** High-signal provider formats. A match here is almost never a false positive. */
const PROVIDER = [
  [/-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/, 'private key block'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, 'GitHub token'],
  [/\bsk_live_[A-Za-z0-9]{16,}\b/, 'Stripe live secret key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API key'],
  [/\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/, 'SendGrid key'],
]

/** A secret-shaped name assigned a long literal — how the Braintree key leaked. */
const ASSIGNMENT =
  /(private_?key|api_?key|secret|password|passwd|access_?token|auth_?token|client_?secret)["']?\s*[:=]\s*["'`]([A-Za-z0-9+/=_\-.]{16,})["'`]/i

/**
 * Lines that name a secret without containing one.
 *
 * `process.env.X` and placeholders are the overwhelming majority of matches, and
 * a hook that cries wolf on them gets bypassed by reflex.
 */
const INNOCENT =
  /process\.env|import\.meta\.env|\$\{|<[A-Z_]+>|xxx+|placeholder|example|changeme|your[-_]|dummy|redacted|\*{4,}/i

const findings = []

const staged = git('diff', '--cached', '--name-only', '--diff-filter=ACM')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)

for (const file of staged) {
  // An env file in a commit is a mistake regardless of what is inside it.
  if (/(^|\/)\.env($|\.)/.test(file) && !/\.example$|\.sample$|\.template$/.test(file)) {
    findings.push({ file, line: '-', why: 'env file staged — these hold credentials and are gitignored for a reason' })
    continue
  }
  if (SKIP.some((re) => re.test(file))) continue

  let diff = ''
  try {
    diff = git('diff', '--cached', '--unified=0', '--', file)
  } catch {
    continue
  }

  let lineNo = 0
  for (const raw of diff.split('\n')) {
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (hunk) { lineNo = Number(hunk[1]); continue }
    if (!raw.startsWith('+') || raw.startsWith('+++')) continue

    const line = raw.slice(1)
    lineNo += 1
    if (INNOCENT.test(line)) continue

    for (const [re, why] of PROVIDER) {
      if (re.test(line)) findings.push({ file, line: lineNo, why })
    }
    const assigned = line.match(ASSIGNMENT)
    // A value that is all one case with no digits is far more likely to be prose
    // or a variable name than a credential.
    if (assigned && /\d/.test(assigned[2]) && !/^[a-z_]+$/.test(assigned[2])) {
      findings.push({ file, line: lineNo, why: `${assigned[1]} assigned a literal value` })
    }
  }
}

if (findings.length === 0) process.exit(0)

console.error('\n  Commit blocked — possible credentials in staged changes:\n')
for (const f of findings) console.error(`    ${f.file}:${f.line}\n      ${f.why}\n`)
console.error('  Load it from process.env instead, and keep the value in .env.local.')
console.error('  If this is a false positive:  ALLOW_SECRET=1 git commit ...\n')
process.exit(1)
