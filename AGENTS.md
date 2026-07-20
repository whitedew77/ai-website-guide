# Repository agent instructions

## Scope

- This repository is the only project in scope.
- Do not inspect, search, copy, modify, stage, commit, or reference neighboring projects or parent-directory contents.
- Resolve relative paths from this repository root. Do not add external writable roots merely for convenience.

Before every Git operation, run and report:

```bash
git rev-parse --show-toplevel
git remote -v
git status --short
```

Stop if the reported root is not this repository.

## Public privacy boundary

- Never add real customer, company, personal, contract, test, or internal-project data.
- Never add API keys, passwords, tokens, private keys, `.env` files, private domains, or machine-specific absolute paths.
- Examples must be explicitly fictional.
- Privacy findings should report only file, line, and rule. Do not echo suspected secrets.
- For project-specific terms, use `SOP_PRIVATE_TERMS` or the ignored `.privacy-denylist.local` file.

## Required verification

Before proposing a commit or release, run:

```bash
npm test
npm run lint
npm run privacy:scan
```

- Do not skip failures. Diagnose them and report the cause.
- `dist/`, dependency folders, caches, logs, and local deny lists must remain ignored.
- The static Pages candidate is `dist/client/`; do not publish the complete `dist/server/` tree without a separate privacy and deployment review.

## Content and catalog rules

- Distinguish confirmed facts, engineering judgment, and unverified information.
- Re-check time-sensitive versions, prices, stars, plan limits, maintenance status, and product capabilities against primary sources.
- `catalog/skills-reviewed.json` is the only catalog the site may describe as reviewed.
- Automation may prepare metadata evidence, but it must not automatically promote a new Skill into the reviewed catalog.
- Do not add installation commands unless the command and its permissions were verified from the source repository.

## GitHub and release boundary

- Commit, remote creation, push, repository visibility changes, releases, Pages deployment, domains, analytics, and public data collection each require explicit user authorization.
- Source publication and website deployment are separate release stages and must be verified separately.
- Preserve user changes and stage only files that belong to the approved scope.
