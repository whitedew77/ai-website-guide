import type { Locale, ReviewedSkillCatalog, SkillRecord } from "./types";

interface SkillCopy {
  name?: string;
  purpose: string;
  limitations: string;
  permissions: string[];
  installNote: string;
}

const SKILL_EN: Record<string, SkillCopy> = {
  "openai-frontend-app-builder": {
    purpose: "Organizes frontend application implementation inside Codex's web-building plugin.",
    limitations: "This is a plugin-bundled Skill, not a standalone Skill guaranteed to work when copied elsewhere.",
    permissions: ["May call website-building tools provided by the plugin", "May create or modify local code"],
    installNote: "Find Build Web Apps in Codex Plugins and review its manifest and permissions before installation. This catalog does not provide an unverified shell command.",
  },
  "openai-frontend-testing-debugging": {
    purpose: "Provides a plugin workflow for frontend testing, reproduction, and debugging.",
    limitations: "Browser-tool availability depends on the current Codex environment, and the workflow cannot replace business acceptance.",
    permissions: ["May control a browser", "May run test commands", "May modify local code"],
    installNote: "Review Build Web Apps in Codex Plugins and confirm browser and local-execution permissions before installation.",
  },
  "openai-react-best-practices": {
    name: "react-best-practices (OpenAI example)",
    purpose: "Provides plugin-bundled rules for implementing and reviewing React websites.",
    limitations: "Only relevant to React projects; check rules against the project version and official documentation.",
    permissions: ["Read and review local code", "May modify React code"],
    installNote: "Use as part of Build Web Apps only after confirming that the project uses React.",
  },
  "openai-shadcn-best-practices": {
    purpose: "Constrains component choice and implementation when using shadcn/ui.",
    limitations: "Not relevant to non-React projects and not a substitute for brand or user-flow design.",
    permissions: ["May add or modify component source", "May run component installation commands"],
    installNote: "Use through Build Web Apps only after the project has deliberately chosen shadcn/ui.",
  },
  "openai-stripe-best-practices": {
    purpose: "Provides implementation and review guidance for a Stripe payment integration.",
    limitations: "Payments are high risk; this Skill does not replace regional-availability, legal, finance, and official-documentation review.",
    permissions: ["May read or write payment code", "May access documentation online", "May encounter test credentials, which must never be placed in prompts"],
    installNote: "Use only after Stripe and a payment owner are confirmed; review plugin permissions and current Stripe documentation first.",
  },
  "openai-supabase-best-practices": {
    purpose: "Guides data, authentication, and storage implementation with Supabase.",
    limitations: "Row-level security, backups, and production permissions still require human review and real-environment tests.",
    permissions: ["May change database and authentication configuration", "May run migrations", "May require network access"],
    installNote: "Use only after Supabase is selected. Production database writes require separate confirmation.",
  },
  "vercel-web-design-guidelines": {
    purpose: "Reviews web interfaces against guidelines for accessibility, interaction, forms, performance, and responsive behavior.",
    limitations: "General guidelines cannot replace brand evidence, real users, or business evidence.",
    permissions: ["Read UI code", "May read updated guidelines online"],
    installNote: "The repository README documents a command that installs a collection of Skills. Review the repository and expected changes before running it.",
  },
  "vercel-react-best-practices": {
    name: "react-best-practices (Vercel)",
    purpose: "Provides impact-ranked rules for React and Next.js performance implementation and review.",
    limitations: "Do not install for non-React projects; rules evolve with frameworks and must match the project version.",
    permissions: ["Read and modify React code", "May read updated rules online"],
    installNote: "A repository-level install command is documented in the README; after installation, verify that the current agent actually discovers the Skill.",
  },
  "vercel-composition-patterns": {
    purpose: "Helps React components avoid boolean-prop growth and establish composable boundaries.",
    limitations: "Useful when a React component API is already complex; avoid over-abstracting small pages.",
    permissions: ["Read and refactor React components"],
    installNote: "Uses the same repository-level installation. Confirm that component-architecture refactoring is actually needed first.",
  },
  "matt-to-spec": {
    purpose: "Turns well-understood discussion and context into a verifiable specification.",
    limitations: "It does not conduct the business interview for you; incorrect input context produces an incorrect spec.",
    permissions: ["Read project context", "May write local issues or documentation"],
    installNote: "No Codex install command was verified on the reviewed page. Inspect the source, then follow OpenAI project-level .agents/skills conventions.",
  },
  "matt-tdd": {
    purpose: "Uses a red-green-refactor loop to create fast feedback for features and fixes.",
    limitations: "Do not force test-first work onto visual exploration or unknown requirements; prototype first, then lock down behavior.",
    permissions: ["Run tests", "Create and modify tests and implementation code"],
    installNote: "Review the source, then use a project-level Skill directory or a trusted Skill installer.",
  },
  "matt-diagnosing-bugs": {
    purpose: "Diagnoses bugs in the order reproduce, minimize, hypothesize, observe, fix, and regression-test.",
    limitations: "Requires a reproducible environment and sufficient observation; it cannot turn speculation into a root cause.",
    permissions: ["Read logs", "Run diagnostic commands", "Modify code and tests"],
    installNote: "After source review, follow OpenAI Skill-directory conventions and check permissions again before running diagnostic commands.",
  },
  "matt-research": {
    purpose: "Researches questions from high-confidence direct sources and produces cited conclusions.",
    limitations: "Needs network access and source judgment; not every page is accessible and facts can expire.",
    permissions: ["Search and read sources online", "May write research documents"],
    installNote: "Review network scope and output locations before installing through project-level Skill conventions.",
  },
  "matt-grill-with-docs": {
    purpose: "Challenges a plan against domain documents, clarifies terms, and updates context and ADRs.",
    limitations: "Outdated domain documents can preserve old mistakes; accountable business owners must participate.",
    permissions: ["Read and modify project documentation", "Ask the user for decisions iteratively"],
    installNote: "First ensure that the project has trustworthy domain documentation, then use project-level Skill conventions.",
  },
  "matt-code-review": {
    purpose: "Reviews code differences separately for engineering quality and conformance to the spec.",
    limitations: "The repository version may use parallel sub-agents; support depends on the current environment.",
    permissions: ["Read Git diffs and project rules", "May call sub-agents", "Must not merge automatically"],
    installNote: "Review its sub-agent requirements before installation; use it as a study checklist when those capabilities are absent.",
  },
  "matt-prototype": {
    purpose: "Creates an explicitly disposable prototype for a design or business question.",
    limitations: "A prototype needs an exit condition and must not silently become production code.",
    permissions: ["Create local prototype files", "May start a local server"],
    installNote: "Install through the project-level Skill directory and state whether the prototype is disposable in the task.",
  },
  "matt-implement": {
    purpose: "Drives implementation from a spec or tickets and closes the loop with tests and code review.",
    limitations: "This is a heavy orchestration workflow and adds unnecessary ceremony to small changes.",
    permissions: ["Broadly modify code", "Run tests", "May call other Skills or agents", "May create commits"],
    installNote: "Use only when the spec, task boundary, and commit policy are already explicit.",
  },
  "matt-to-tickets": {
    purpose: "Breaks a spec into dependent tracer-bullet vertical-slice tasks.",
    limitations: "Must be adapted to the issue tracker; slices that are too small lose the user outcome.",
    permissions: ["Write to a local or remote issue tracker", "May create multiple tasks"],
    installNote: "Confirm the tracker and write scope before installation. Creating remote issues is an external write.",
  },
  "addy-spec-driven-development": {
    purpose: "A study reference for encoding spec-first planning and implementation into agent workflows.",
    limitations: "The reviewed README does not provide a verified native Codex install command; treat it as a method reference first.",
    permissions: ["No extra permission for reading only", "A ported Skill may write documentation"],
    installNote: "Inspect and port only what is needed. Do not run plugin commands intended for a different agent platform.",
  },
  "addy-frontend-ui-engineering": {
    purpose: "A study reference for component architecture, responsive behavior, state management, and accessibility gates.",
    limitations: "The guidance is broad and cannot replace the project's own design system.",
    permissions: ["No extra permission for reading only", "A ported version may modify UI code"],
    installNote: "Inspect the source first. A Codex port must review triggers and scripts against the Agent Skills format.",
  },
  "addy-security-hardening": {
    purpose: "A study reference for input boundaries, secrets, identity, and common web risks.",
    limitations: "A security checklist is not a penetration test or compliance certification; use a project-specific threat model.",
    permissions: ["No extra permission for reading only", "A ported version may run dependency or security scans"],
    installNote: "Use as a review reference and inspect network and file permissions before running any scanning script.",
  },
  "addy-shipping-launch": {
    purpose: "A study reference for pre-release checks, staged rollout, monitoring, and rollback.",
    limitations: "The generic workflow must be mapped to the real hosting platform, data, and accountable owners.",
    permissions: ["No extra permission for reading only", "A ported version may operate deployments"],
    installNote: "Use as a release-method reference only. Every production deployment still requires human authorization.",
  },
  "obra-superpowers": {
    name: "Superpowers (complete plugin)",
    purpose: "A complete method system spanning brainstorming, planning, TDD, sub-agent development, and code review.",
    limitations: "It is a heavy workflow that changes how the coding agent works; it is not a beginner default and should not be combined casually with other orchestration systems.",
    permissions: ["Plugin-level workflows", "May create worktrees", "May call sub-agents", "May run tests and create commits", "Optional telemetry requires review"],
    installNote: "In the Codex app, open Plugins, find Superpowers under Coding, and review permissions. Do not use install commands for another agent platform.",
  },
};

const MAINTENANCE_EN =
  "At the review date, the public repository and exact path were reachable. The allowlist updater continues to check archive status and recent pushes.";
const ISSUE_RELEASE_EN =
  "Maintenance signals use repository-level issues, releases, and commits; repository activity is not treated as a separate version promise for this Skill.";
const LICENSE_EN =
  "No repository-wide license was clearly identified at review time; inspect the relevant files before use.";

export function localizeSkill(skill: SkillRecord, locale: Locale): SkillRecord {
  if (locale === "zh") return skill;
  const copy = SKILL_EN[skill.id];
  if (!copy) throw new Error(`Missing English Skill translation: ${skill.id}`);
  return {
    ...skill,
    ...copy,
    license: skill.license === "MIT" ? "MIT" : LICENSE_EN,
    maintenanceNote: MAINTENANCE_EN,
    issueReleaseNote: ISSUE_RELEASE_EN,
  };
}

export function localizeCatalog(
  catalog: ReviewedSkillCatalog,
  locale: Locale,
): ReviewedSkillCatalog {
  if (locale === "zh") return catalog;
  return { ...catalog, skills: catalog.skills.map((skill) => localizeSkill(skill, locale)) };
}
