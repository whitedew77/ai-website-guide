# Public content audit

Reviewed: 2026-07-20

This log records corrections made for the public handbook without naming or reproducing any private project, repository path, test data, company, customer, or internal case.

## Product and workflow corrections

| Earlier pattern | Public correction | Reason |
|---|---|---|
| A reference-heavy homepage | Three entry points, with the six-question wizard as the primary action | A beginner needs one first action before a reference library. |
| Four fixed checks per stage and a fixed total | Conditional Gates by site type, declared features, region and risk | A brochure site, ecommerce site and authenticated app do not have the same evidence burden. |
| Region selection replacing the stack recommendation | Region is an additive constraint | Hosting, network and regulatory checks can change deployment decisions without determining the entire architecture. |
| Existing design/code treated as completed history | Earlier stages start at `待验收 / 待复核` | Existing artifacts are evidence to inspect, not proof that a Gate passed. |
| Checkbox-only progress | A Gate passes only with both evidence and approval | Self-certification without an artifact or acceptance record is not auditable. |
| Linear, irreversible waterfall | Linear visual route with evidence-based return loops | Content, design and architecture often change each other as evidence appears. |
| “SDD” presented as one universal expansion | Explicitly defined here as Spec-Driven Development, with an ambiguity warning | SDD is used for other concepts in other sources. |
| “Vibe Coding” presented as a formal method | Marked as an informal industry term | It is not a standards body specification or a single engineering process. |
| GitHub source, local discovery and runtime availability mixed together | Three separate statuses | A repository existing online does not prove it is installed or callable in the current session. |

## Current reviewed content

- 7 website types and 6 onboarding questions.
- 8 stages with conditional evidence Gates and 6 statuses.
- 12 reusable prompt templates composed with project type and stage context.
- 25 technology records and 61 glossary records, each with a direct source and review date.
- 23 GitHub Skill/plugin candidates: 12 core, 7 conditional and 4 study-only.

Counts are build facts for this review, not marketing targets. Entries may be removed when a source, path, license or claim cannot be verified.

## Skill source review boundary

The first catalog only covers these public repositories:

- [openai/plugins](https://github.com/openai/plugins)
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- [obra/superpowers](https://github.com/obra/superpowers)

Each record stores the repository, exact path, ref, publisher, license statement, permissions/external actions, use stage, limitations, install type, review date, maintenance note and Issue/Release interpretation. A command is shown only when it was confirmed from the repository; otherwise the UI links to source and explains the missing installation claim.

The archived [`openai/skills`](https://github.com/openai/skills) repository is not treated as the current OpenAI example catalog. Current public examples are reviewed from [`openai/plugins`](https://github.com/openai/plugins). OpenAI's model for Skills and Plugins is also checked against [Build Skills](https://learn.chatgpt.com/docs/build-skills) and [Build Plugins](https://learn.chatgpt.com/docs/build-plugins).

## Claims intentionally kept out of evergreen copy

- Current stars, pricing, plan limits and package versions.
- “Best” stack claims without project constraints.
- Legal or security guarantees.
- Statements that a locally discovered Skill is available to the current agent.
- Unreviewed installation commands or scripts from newly found repositories.

## Known limits

- The catalog review is a dated snapshot; weekly automation creates metadata evidence and a review PR, not an automatic recommendation.
- A privacy scan is a guardrail, not proof that every contextual disclosure has been found.
- The generated route is decision support. Payment, personal data, regulated content and production operations still require an accountable human reviewer.
