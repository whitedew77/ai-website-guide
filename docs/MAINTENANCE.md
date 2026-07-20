# Maintenance and review policy

## Source of truth

- `catalog/skills-reviewed.json` is the only catalog the website may present as reviewed.
- `catalog/skill-repositories.json` is a GitHub metadata whitelist, not a recommendation list.
- `catalog/repository-metadata.json` and `reports/skill-catalog-update.md` are generated evidence for a human review.
- The app, generated static PWA entry `public/index.html`, and `public/offline.html` all import the same TypeScript/JSON content sources.

## Adding or updating a Skill

1. Confirm the repository is on the whitelist.
2. Pin or record the reviewed ref and exact `SKILL.md` or plugin manifest path.
3. Read the complete Skill and referenced scripts. Record Shell, network, credential and external-write behavior.
4. Confirm the publisher and license. If the license is unclear, say so; do not infer one.
5. Score task fit 30%, maintenance 20%, safety 20%, clarity/testability 15%, portability 10% and popularity 5%.
6. Add it to `catalog/skills-reviewed.json` only after review. Core recommendations must remain at twelve or fewer.
7. Increment `catalogVersion`, update `reviewedAt`, run `npm test`, and inspect the change in the browser.

Repository stars, pricing, product limits and package versions are snapshots only. Do not copy them into evergreen explanatory text.

## Privacy review

Run `npm run privacy:scan`. For project-specific names, also provide a comma-separated local environment value named `SOP_PRIVATE_TERMS`, or create an ignored `.privacy-denylist.local` file with one private term per line. The scan intentionally reports only file, line and rule; it does not echo the matched content.

The scanner is a guardrail, not proof. A human still reviews examples, screenshots, sources and generated offline files before public release.

## Release boundary

This repository builds locally but does not publish by itself. GitHub Pages, a custom domain, analytics, production forms and public user-data collection require a separate decision and authorization.
