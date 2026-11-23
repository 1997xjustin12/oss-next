# Contributing: the git flow

How a change gets from an idea to production in this repository. Agreed 2026-11-23.

## Branches

| Branch | What it is | Who writes to it |
|---|---|---|
| `integrate-wp-render` | **Production.** Coolify deploys it. It plays the part classic git flow calls `main`. | Release and hotfix PRs only |
| `develop` | Finished work waiting for the next release | Feature and fix PRs |
| `feature/<name>` | A new feature, or a change to an existing one | You, from `develop` |
| `fix/<name>` | A bug fix that can wait for the next release | You, from `develop` |
| `hotfix/<name>` | A production bug that cannot wait | You, from `integrate-wp-render` |
| `chore/<name>` | Tooling, docs, dependencies | You, from `develop` |

**Mirrors**, always the same commit as `integrate-wp-render`, updated after every release or hotfix:
`origin/main`, `oss-next/main`, `oss-next/staging`. Nobody commits to a mirror.

Names: lowercase, words joined by hyphens, short: `feature/city-sitemap`, `fix/accessory-dark-mode`.

There is no staging site (`oss-next/staging` is not deployed), so `develop` is checked by the PR checks and a local
`npm run build`, not on a server.

## A feature, a fix, or a change to an existing feature

```bash
git switch develop && git pull
git switch -c feature/city-sitemap          # or fix/… or chore/…
# … work, commit (small commits, each one building) …
git push -u origin feature/city-sitemap
gh pr create --base develop --fill          # or open the PR on GitHub
```

1. Wait for the **Checks** workflow (types, lint, unit tests) to pass on the PR.
2. Review is optional: the author may merge their own PR.
3. Merge into `develop`, then delete the branch.

## Release to production

When `develop` holds what should go live:

```bash
git switch develop && git pull
npm run build                               # must exit 0: CI cannot build (no backend credentials)
gh pr create --base integrate-wp-render --head develop --title "Release 2026-11-23"
```

1. Checks pass, merge the PR with a **merge commit** (not squash, so `develop` and production keep the same history).
2. Tag it and update the mirrors:

```bash
git switch integrate-wp-render && git pull
git tag -a v2026.11.23 -m "Release 2026-11-23" && git push origin v2026.11.23
git push origin integrate-wp-render:main
git push oss-next integrate-wp-render:main
git push oss-next integrate-wp-render:staging
```

A second release on the same day: `v2026.11.23.2`.

## Hotfix (production is broken)

```bash
git switch integrate-wp-render && git pull
git switch -c hotfix/checkout-total
# … fix, commit, npm run build …
git push -u origin hotfix/checkout-total
gh pr create --base integrate-wp-render --fill
```

1. Merge it, then tag and update the mirrors as for a release.
2. **Bring the fix back to `develop`**, or the next release undoes it:

```bash
git switch develop && git pull
git merge integrate-wp-render && git push
```

## Rules

- Never commit straight to `integrate-wp-render` or `develop`; always a branch and a PR. GitHub cannot enforce this on
  this plan, so it is on us.
- Never force-push `integrate-wp-render`, `develop` or a mirror.
- Before a PR, rebase your branch on its base if the base moved: `git fetch && git rebase origin/develop`.
- A PR that fails its checks is not merged.
- Rolling back: re-deploy the previous tag, or revert the release merge on `integrate-wp-render` (`git revert -m 1 <merge>`)
  through a hotfix PR.
