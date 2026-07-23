import type {
  GateDefinition,
  Locale,
  PromptField,
  PromptTemplate,
  StageDefinition,
} from "./types";
import {
  CONTENT_OWNERS,
  FEATURES,
  PRIORITIES,
  PROMPT_TEMPLATES,
  REGIONS,
  STAGES,
  STAGE_STATUS_LABELS,
  START_POINTS,
  WEBSITE_TYPES,
} from "./workflow-content";

type LabeledOption = { id: string; label: string; description: string };

function localizeOptions<T extends LabeledOption>(
  source: T[],
  translations: Record<string, Pick<LabeledOption, "label" | "description">>,
): T[] {
  return source.map((item) => {
    const translated = translations[item.id];
    if (!translated) throw new Error(`Missing English option translation: ${item.id}`);
    return { ...item, ...translated };
  });
}

const WEBSITE_TYPE_EN = {
  corporate: { label: "Company website", description: "Explain the business, capabilities, and proof, then capture enquiries." },
  landing: { label: "Landing page", description: "Focus on one campaign, product, or conversion goal." },
  portfolio: { label: "Portfolio", description: "Present work and services from a person or team." },
  blog: { label: "Blog / documentation", description: "Publish articles, tutorials, or product documentation over time." },
  app: { label: "Web app / SaaS", description: "Let signed-in users complete ongoing tasks online." },
  ecommerce: { label: "E-commerce", description: "Products, inventory, orders, payments, and after-sales service." },
  internal: { label: "Internal tool", description: "Team workflows for approvals, data, or operations." },
};

const START_POINT_EN = {
  idea: { label: "Idea only", description: "There is no organized source material yet." },
  materials: { label: "Materials available", description: "Copy, images, business material, or research already exists." },
  design: { label: "Design available", description: "Wireframes, a prototype, or visual designs already exist." },
  code: { label: "Code available", description: "Development has already started." },
  live: { label: "Live website", description: "The site needs improvement, handover, or ongoing operation." },
};

const FEATURE_EN = {
  login: { label: "Sign-in", description: "The site must identify different users." },
  permissions: { label: "Permissions", description: "Roles can view or change different information." },
  "personal-data": { label: "Personal data", description: "Names, phone numbers, email addresses, or similar data will be collected." },
  upload: { label: "File uploads", description: "Users can upload images, documents, or other files." },
  payment: { label: "Payments / transactions", description: "Payments, refunds, orders, or reconciliation are involved." },
};

const CONTENT_OWNER_EN = {
  "self-ai": { label: "Me / AI", description: "Content changes infrequently and can be updated through code or files." },
  developer: { label: "Developer", description: "A person who can code maintains and publishes the content." },
  operator: { label: "Content operator", description: "A visual editor or CMS is required." },
  approval: { label: "Multi-person approval", description: "Draft, review, publish, and permission records are required." },
};

const REGION_EN = {
  mainland: { label: "Mainland China", description: "Registration, network, cloud-service, and data requirements need separate review." },
  global: { label: "Global", description: "Prioritize global CDN coverage, international-service compatibility, and multiple languages." },
  both: { label: "Mainland China and global", description: "Validate network paths, compliance, and third-party availability separately." },
};

const PRIORITY_EN = {
  speed: { label: "Fastest launch", description: "Prefer mature managed services and less customization." },
  cost: { label: "Cost", description: "Prefer static approaches and predictable expenses." },
  ownership: { label: "Code ownership", description: "Prefer exportable, portable, standards-based technology." },
  "visual-editing": { label: "Visual editing", description: "Prefer a CMS or builder that non-developers can maintain." },
  scale: { label: "Complex growth", description: "Prefer explicit boundaries, testing, and scalable infrastructure." },
};

interface StageCopy {
  title: string;
  plainGoal: string;
  deliverables: string[];
  gates: Record<string, Pick<GateDefinition, "title" | "help" | "evidenceExample">>;
}

const STAGE_EN: Record<number, StageCopy> = {
  1: {
    title: "Define the goal and website type",
    plainGoal: "State whose problem the website solves and what observable success looks like.",
    deliverables: ["Project brief", "Primary-user description", "Success measures and boundaries"],
    gates: {
      goal: {
        title: "Goals and non-goals are explicit",
        help: "Write at least one business goal and what this release will deliberately not include.",
        evidenceExample: "A project-brief link or an approved goals/non-goals note.",
      },
      audience: {
        title: "Primary user and task are confirmed",
        help: "“Everyone” is not a primary audience. Identify one main user and why they visit.",
        evidenceExample: "A persona, interview note, or confirmation from the business owner.",
      },
      success: {
        title: "Success can be observed",
        help: "Use outcomes such as a valid enquiry, purchase, or found answer—not “looks premium.”",
        evidenceExample: "One to three checkable business or user outcomes.",
      },
    },
  },
  2: {
    title: "Collect user, business, and content sources",
    plainGoal: "Prepare verifiable facts, content, and sources so AI does not invent them.",
    deliverables: ["Source register", "Content inventory", "Gaps and owners"],
    gates: {
      sources: {
        title: "Important facts have sources",
        help: "Company, product, price, policy, capability, and case-study claims cannot come from AI alone.",
        evidenceExample: "A source list with date, owner, and public-use scope.",
      },
      "content-inventory": {
        title: "Required page content is inventoried",
        help: "Mark copy, images, and data as available, missing, needing revision, or prohibited from publication.",
        evidenceExample: "A content spreadsheet or page-by-page asset list.",
      },
      "content-owner": {
        title: "Content ownership is assigned",
        help: "Name who updates and approves content after launch, and how often it is reviewed.",
        evidenceExample: "Named owners and a review workflow.",
      },
      "data-inventory": {
        title: "Personal and sensitive data is inventoried",
        help: "Record what is collected, why, retention time, and who can access it.",
        evidenceExample: "A data inventory or privacy review.",
      },
    },
  },
  3: {
    title: "Write the spec, page structure, and content list",
    plainGoal: "Turn conversation into a bounded, testable, handoff-ready agreement.",
    deliverables: ["Spec / PRD", "Sitemap", "Page content and acceptance checklist"],
    gates: {
      spec: {
        title: "The spec defines scope, non-scope, and constraints",
        help: "Cover goals, users, features, content, technical/business constraints, and unknowns.",
        evidenceExample: "A reviewed spec or PRD.",
      },
      sitemap: {
        title: "Page structure and user journeys are confirmed",
        help: "Every page must serve a user task rather than exist only to increase page count.",
        evidenceExample: "Sitemap, primary navigation, and key journeys.",
      },
      acceptance: {
        title: "Key outcomes have testable acceptance criteria",
        help: "Describe user-visible results, including errors, empty states, and mobile behavior.",
        evidenceExample: "Given/When/Then scenarios or a clear acceptance checklist.",
      },
      "commerce-rules": {
        title: "Transaction rules and exception flows are confirmed",
        help: "Cover price, inventory, payment failure, refunds, order states, and support ownership.",
        evidenceExample: "An order-state diagram or transaction rules.",
      },
    },
  },
  4: {
    title: "Choose the technology and validate the design",
    plainGoal: "Choose tools from requirements and validate the most important pages and interactions first.",
    deliverables: ["Architecture decision record (ADR)", "Prototype or visual design", "Risk and constraint register"],
    gates: {
      adr: {
        title: "Primary, simpler, and scalable options are compared",
        help: "Explain the choice, when it does not fit, and migration or lock-in risks.",
        evidenceExample: "An ADR or technology comparison.",
      },
      prototype: {
        title: "Key pages or flows are validated with realistic content",
        help: "Cover the first screen, primary action, and important error or empty states.",
        evidenceExample: "An accessible prototype, screenshots, or a review record.",
      },
      "mainland-constraint": {
        title: "Mainland China access constraints are validated separately",
        help: "Treat region as an added constraint. Check registration, network, third-party scripts, and data requirements.",
        evidenceExample: "Service-availability, registration, and compliance checks.",
      },
      "threat-model": {
        title: "High-risk features have a minimum threat model",
        help: "List assets, entry points, abuse cases, permission boundaries, and failure consequences.",
        evidenceExample: "A threat model or security-design review.",
      },
    },
  },
  5: {
    title: "Establish the repository, AI context, and quality baseline",
    plainGoal: "Give AI boundaries, feedback, and checks before expanding the change.",
    deliverables: ["Code repository", "Project context and ADRs", "Automated-check baseline"],
    gates: {
      repository: {
        title: "The repository installs and builds in a clean environment",
        help: "Document the entry point and include lockfiles, runtime requirements, and environment examples.",
        evidenceExample: "A clean-environment build record or CI result.",
      },
      "ai-context": {
        title: "AI can read the goals, boundaries, and engineering constraints",
        help: "Include project context, terminology, directory boundaries, prohibitions, and verification commands.",
        evidenceExample: "Links to AGENTS.md, CONTEXT.md, the spec, and ADRs.",
      },
      "quality-baseline": {
        title: "Type, lint, test, and build checks are repeatable",
        help: "Projects need different test depth, but every project needs fast feedback.",
        evidenceExample: "Local or CI quality commands with passing results.",
      },
      secrets: {
        title: "Secrets and environment configuration are absent from public code",
        help: "Use example variables, secret scanning, and least privilege. Never store server secrets in client code.",
        evidenceExample: "Secret-scan results and an environment-variable inventory.",
      },
    },
  },
  6: {
    title: "Develop with AI in vertical slices",
    plainGoal: "Complete one small user-visible outcome at a time and verify it immediately.",
    deliverables: ["Vertical-slice task", "Implementation and tests", "Change note"],
    gates: {
      "thin-slice": {
        title: "The task is sliced by user outcome",
        help: "A slice should work from interface to data/content instead of spreading work across every layer.",
        evidenceExample: "Scope, non-scope, and acceptance criteria for one task.",
      },
      "feedback-loop": {
        title: "Each slice has automated or repeatable feedback",
        help: "Include at least a build, a targeted test, or a browser check.",
        evidenceExample: "Test output, screenshots, or reproduction steps.",
      },
      "reviewed-change": {
        title: "The change matches the spec, architecture, and security boundaries",
        help: "Review whether the right requirement was built as well as code quality.",
        evidenceExample: "A code-review record or self-review checklist.",
      },
    },
  },
  7: {
    title: "Test, fix, and obtain business acceptance",
    plainGoal: "Prove the site works with realistic devices, content, and failure conditions.",
    deliverables: ["Test report", "Accessibility and performance checks", "UAT decision"],
    gates: {
      functional: {
        title: "Critical and failure paths are tested",
        help: "Cover normal use, empty data, offline behavior, invalid input, and service failure.",
        evidenceExample: "Automated or manual test records.",
      },
      "responsive-a11y": {
        title: "Mobile, keyboard, zoom, and semantics are checked",
        help: "At minimum test 390px, keyboard operation, 200% zoom, clear labels, and visible focus.",
        evidenceExample: "Screenshots, a keyboard path, and accessibility-check results.",
      },
      uat: {
        title: "The business owner accepts against the criteria",
        help: "AI and developers cannot sign off for content, business, or compliance owners.",
        evidenceExample: "UAT records, failed items, and the final decision.",
      },
      "security-test": {
        title: "Permissions, input, uploads, or payments receive targeted security tests",
        help: "Test unauthorized access, abuse, invalid data, rate limits, and sensitive-data exposure.",
        evidenceExample: "Security-test records and residual risks.",
      },
    },
  },
  8: {
    title: "Release, monitor, and improve continuously",
    plainGoal: "Make launch observable, reversible, and owned instead of ending at upload.",
    deliverables: ["Release and rollback plan", "Monitoring and owners", "Launch retrospective"],
    gates: {
      "release-plan": {
        title: "Release steps, owners, and window are confirmed",
        help: "Include domain, environment variables, migrations, caches, forms, and third-party services.",
        evidenceExample: "A release checklist and approval record.",
      },
      rollback: {
        title: "Rollback conditions and recovery steps are rehearsed",
        help: "Define the signals that trigger rollback, the recovery target, and how data is handled.",
        evidenceExample: "A rehearsal record or executable rollback procedure.",
      },
      monitoring: {
        title: "Key availability and business outcomes are observable",
        help: "Static sites still need availability and form checks; dynamic systems also need errors, latency, and key events.",
        evidenceExample: "A dashboard, alert rules, or assigned recurring checks.",
      },
      "privacy-release": {
        title: "Privacy, retention, and user rights are operational",
        help: "Public statements must match real data handling; verify deletion, export, and withdrawal paths.",
        evidenceExample: "Privacy notice, data flow, and acceptance record.",
      },
    },
  },
};

interface PromptCopy {
  title: string;
  when: string;
  preparation: string[];
  deliverables: string[];
  acceptance: string[];
  stopConditions: string[];
  executionSteps: string[];
  fields: Record<string, Pick<PromptField, "label" | "description" | "example">>;
}

const PROMPT_EN: Record<string, PromptCopy> = {
  "project-kickoff": {
    title: "Project kickoff and requirements interview",
    when: "Use when the project is still an idea or the goal and audience are not yet explicit.",
    preparation: ["Existing source material", "Business context", "Known constraints"],
    deliverables: ["Project brief", "Goals and non-goals", "Primary user and task", "Unknowns and owners"],
    acceptance: ["Facts are separated from assumptions", "Success is observable", "Unknowns have named owners"],
    stopConditions: ["A key decision-maker is unavailable", "The request depends on confidential material that is not authorized for use"],
    fields: {
      projectName: { label: "Project name", description: "A working name is fine; do not enter customer-private data.", example: "Pine Grove Coffee Website (fictional example)" },
      audience: { label: "Primary user", description: "Name one main audience and visit context.", example: "Freelancers looking for a quiet nearby workspace" },
      businessGoal: { label: "Business goal", description: "Describe a measurable outcome rather than a visual preference.", example: "Increase qualified workspace bookings from local search" },
      knownMaterials: { label: "Known material", description: "List available, approved sources and gaps.", example: "Approved menu, opening hours, address, and licensed interior photos" },
    },
    executionSteps: ["Restate confirmed facts and assumptions", "Interview for user, goal, scope, and constraints", "List unknowns without guessing", "Draft a concise brief", "Ask the responsible person to confirm it"],
  },
  "source-research": {
    title: "Source-backed research",
    when: "Use when claims, market context, requirements, or product capabilities need verification.",
    preparation: ["A specific research question", "Preferred primary sources", "Relevant date range"],
    deliverables: ["Findings with direct sources", "Fact/inference/judgment labels", "Conflicts and unknowns"],
    acceptance: ["Time-sensitive claims include dates", "Primary sources are preferred", "Unverified information stays labeled"],
    stopConditions: ["The source cannot be accessed", "Only unsourced summaries support an important claim"],
    fields: {
      researchQuestion: { label: "Research question", description: "Ask one decision-relevant question.", example: "Which hosting option supports this static PWA and the required region?" },
      trustedSources: { label: "Preferred sources", description: "List official documentation or other primary sources.", example: "Vendor documentation, standards, and government guidance" },
      dateScope: { label: "Date scope", description: "State how current the information must be.", example: "Verify against sources updated or available this month" },
    },
    executionSteps: ["Break the question into verifiable claims", "Check direct primary sources", "Record URL, date, and scope", "Separate confirmed facts from inference", "Report conflicts and remaining uncertainty"],
  },
  "content-inventory": {
    title: "Content and data inventory",
    when: "Use when source material exists but publication status, ownership, and gaps are unclear.",
    preparation: ["Available files and links", "Publication permissions", "Content owners"],
    deliverables: ["Page-level inventory", "Keep/rewrite/remove decisions", "Missing items and owners"],
    acceptance: ["Private and public material are separated", "Every gap has an owner", "No invented trust claims"],
    stopConditions: ["Publication rights are unknown", "Personal or customer data has not been sanitized"],
    fields: {
      materialSummary: { label: "Available material", description: "Summarize approved copy, images, data, and sources.", example: "Approved service descriptions, licensed photos, opening hours, and address" },
      publicationRules: { label: "Publication rules", description: "State what is public, private, expired, or requires approval.", example: "No customer names; prices require operations approval; image licenses are recorded" },
    },
    executionSteps: ["List every source and owner", "Classify publication status", "Map material to pages and user tasks", "Identify gaps and duplication", "Produce a reviewable inventory"],
  },
  "spec-prd": {
    title: "Spec / PRD",
    when: "Use when the project needs a bounded, testable agreement before design or implementation.",
    preparation: ["Confirmed project brief", "Research and content inventory", "Business and technical constraints"],
    deliverables: ["Goals and non-goals", "User journeys and requirements", "Acceptance criteria", "Unknowns and risks"],
    acceptance: ["Scope is explicit", "Requirements are user-observable", "Errors, empty states, and mobile are covered"],
    stopConditions: ["A core business rule is unknown", "An unauthorized assumption would change scope or risk"],
    fields: {
      projectName: { label: "Project name", description: "Use a working name without private customer information.", example: "Pine Grove Coffee Website (fictional example)" },
      audience: { label: "Primary user", description: "Describe the main user and context.", example: "Remote workers comparing nearby places to work" },
      businessGoal: { label: "Business goal", description: "Name the result this release should improve.", example: "Generate qualified table and workspace enquiries" },
      scope: { label: "Scope and non-scope", description: "Draw the release boundary.", example: "Includes public pages and enquiry form; excludes accounts and online payment" },
      constraints: { label: "Constraints and unknowns", description: "List content, region, schedule, technology, privacy, and approval boundaries.", example: "Bilingual content; static hosting; operations approves pricing; analytics undecided" },
    },
    executionSteps: ["Confirm facts and decision owners", "Define goals, non-goals, and users", "Write journeys and functional requirements", "Add measurable acceptance and failure states", "List risks and unresolved decisions for review"],
  },
  "sitemap-content": {
    title: "Sitemap and page content",
    when: "Use when deciding which pages exist, how navigation works, and what each page communicates.",
    preparation: ["Primary user tasks", "Content inventory", "Search intent"],
    deliverables: ["Sitemap", "Primary navigation", "Page purpose, content, and CTA", "Missing assets"],
    acceptance: ["Each page has one primary purpose", "Navigation uses user language", "Trust claims have sources"],
    stopConditions: ["Important content is missing with no owner", "Pages exist only to stuff keywords"],
    fields: {
      primaryJourneys: { label: "Key user journeys", description: "State the entry point and final user outcome.", example: "Search → service page → proof → enquiry" },
      availableContent: { label: "Available content", description: "List material confirmed for public use.", example: "Service details, price range, team photos, address, and FAQs" },
    },
    executionSteps: ["Group content by user task", "Design the shortest critical journeys", "Define purpose, evidence, CTA, and source for every page", "Identify duplicate pages that can be removed"],
  },
  "stack-adr": {
    title: "Technology stack and ADR",
    when: "Use after site type, maintainers, and risks are known and an implementation approach must be chosen.",
    preparation: ["Feature and data requirements", "Maintenance model", "Region and priority"],
    deliverables: ["Primary, simpler, and scalable options", "Trade-offs", "Avoid-when conditions", "Migration and rollback impact"],
    acceptance: ["Facts and engineering judgments are separated", "Region is treated as an added constraint", "Popularity does not replace requirements"],
    stopConditions: ["High-risk payment or permission boundaries are undefined", "A critical vendor claim is not verified in official documentation"],
    fields: {
      requirements: { label: "Feature and data requirements", description: "List dynamic behavior, content updates, and stored data.", example: "Weekly price edits; enquiry form; no sign-in; no online payment" },
      teamConstraints: { label: "Team and operations constraints", description: "Who maintains it, coding ability, budget, and timeline.", example: "One non-technical operator edits content; developer provides monthly support" },
      regionConstraints: { label: "Region constraints", description: "State visitor regions and services that require validation.", example: "Visitors in Mainland China and abroad; third-party fonts and analytics need fallbacks" },
    },
    executionSteps: ["Convert requirements into technical constraints", "Provide primary, simpler, and scalable options", "Compare maintenance, security, cost, portability, and regional availability", "Write the ADR and list assumptions to verify"],
  },
  "design-review": {
    title: "Design brief and prototype review",
    when: "Use when AI will design or review an important page or flow.",
    preparation: ["Realistic content", "Brand assets", "User tasks", "Authorized references"],
    deliverables: ["Design brief", "Required states", "Review questions", "Prioritized changes"],
    acceptance: ["The first screen clarifies the next action", "Realistic content length is used", "Mobile and error states are designed"],
    stopConditions: ["Real content or a visual goal is missing", "A business flow is judged only by personal taste"],
    fields: {
      designGoal: { label: "Design goal", description: "Describe what the user should accomplish, not only style words.", example: "Help visitors understand the space and find booking information within ten seconds" },
      visualReferences: { label: "Visual evidence", description: "Brand rules, screenshots, Figma, existing components, or explicit references.", example: "Brand colors, current printed menu, and two authorized reference screenshots" },
      states: { label: "Required states", description: "Include desktop, mobile, empty, error, loading, and success as needed.", example: "390px mobile, form-validation error, success, and offline state" },
    },
    executionSteps: ["Restate the design evidence", "List critical pages and states", "Create or review the prototype", "Check task clarity, accessibility, evidence, and responsive behavior", "Return verifiable change requests"],
  },
  "vertical-slice": {
    title: "Vertical-slice task",
    when: "Use after the spec is confirmed to define one small, complete user outcome.",
    preparation: ["Spec", "Architecture boundaries", "Verification commands"],
    deliverables: ["Slice scope", "Dependencies", "Acceptance criteria", "Rollback point"],
    acceptance: ["One user outcome is delivered at a time", "Test seams are explicit", "Unrelated code is not refactored"],
    stopConditions: ["The slice cannot be verified independently", "A required interface or content decision is unresolved"],
    fields: {
      userOutcome: { label: "User outcome", description: "Describe the user-visible change after this slice.", example: "A visitor can compare plans and submit a valid enquiry" },
      boundaries: { label: "Scope and non-scope", description: "Constrain this change.", example: "Includes form UI, validation, and email adapter; excludes user accounts" },
      verification: { label: "Verification", description: "List commands, page paths, and human checks.", example: "Unit tests, build, 390px form flow, and error-state screenshot" },
    },
    executionSteps: ["List dependencies and risks", "Define the minimum end-to-end path", "Create a failing verification first", "Implement the minimum change", "Verify, record evidence, and stop"],
  },
  "codex-implementation": {
    title: "Codex implementation",
    when: "Use when task scope, code location, and acceptance criteria are explicit.",
    preparation: ["Target repository", "Relevant files", "Spec or task", "Verification method"],
    deliverables: ["In-scope changes", "Verification results", "Risks and incomplete work"],
    acceptance: ["Existing user changes are preserved", "Authorization is not expanded", "Build and targeted tests pass"],
    stopConditions: ["Workspace conflicts cannot be handled safely", "New authority or a high-risk external write is required"],
    fields: {
      implementationTask: { label: "Implementation task", description: "Reference a confirmed task rather than saying only “build a website.”", example: "Implement the home page and enquiry-form slice against spec section 3.2" },
      repoContext: { label: "Repository context", description: "Directories, rules, relevant files, and areas that must not change.", example: "Follow AGENTS.md; edit page and form components; do not change deployment configuration" },
      verification: { label: "Verification", description: "Required tests, builds, and browser paths.", example: "npm test; npm run build; complete one enquiry at desktop and 390px" },
    },
    executionSteps: ["Read project constraints and relevant files", "Restate assumptions and change boundaries", "Implement one vertical slice", "Run verification and fix real failures", "Report completion, evidence, and remaining risks"],
  },
  "quality-review": {
    title: "Testing, accessibility, and performance review",
    when: "Use when core functionality is ready and needs evidence that real users can use it.",
    preparation: ["Critical paths", "Target devices", "Browser and performance goals"],
    deliverables: ["Severity-ranked findings", "Reproduction evidence", "Passed checks and evidence limits"],
    acceptance: ["Keyboard and 200% zoom are covered", "Visible risks are separated from tool-verified facts", "Screenshots are not claimed as WCAG compliance"],
    stopConditions: ["The real flow cannot be accessed", "Differences between test and production are unknown"],
    fields: {
      criticalFlows: { label: "Critical paths", description: "List the flow as user steps.", example: "Home → plans → enquiry → validation error → success" },
      targets: { label: "Targets and thresholds", description: "Viewports, browsers, accessibility, and performance goals.", example: "390px/1440px; keyboard; 200% zoom; Core Web Vitals as observed indicators" },
    },
    executionSteps: ["Capture evidence step by step", "Check functionality, errors, and empty states", "Check responsive behavior, keyboard, semantics, and contrast risks", "Measure before discussing performance", "Return blockers and a retest checklist"],
  },
  "debug-review": {
    title: "Debugging and code review",
    when: "Use for a reproducible problem or before merging a completed slice.",
    preparation: ["Reproduction steps", "Expected and actual behavior", "Logs and recent changes"],
    deliverables: ["Minimal reproduction", "Root-cause evidence", "Fix", "Regression test"],
    acceptance: ["Root cause and symptom are separated", "Changes are evidence-driven", "Regression protection is added"],
    stopConditions: ["The issue cannot be reproduced and there is no observation data", "The fix would expand business scope"],
    fields: {
      symptom: { label: "Problem and reproduction", description: "Write the shortest steps, expected result, and actual result.", example: "At 390px, open the menu and press Tab; focus enters an obscured page link" },
      evidence: { label: "Existing evidence", description: "Logs, screenshots, failed tests, or recent changes.", example: "Failed keyboard test, DOM screenshot, and related commit" },
    },
    executionSteps: ["Reproduce and minimize", "Form falsifiable hypotheses", "Add only necessary observation", "Fix the root cause", "Add regression coverage and review against the spec"],
  },
  "release-review": {
    title: "Release, rollback, and launch review",
    when: "Use immediately before, during, or just after a release.",
    preparation: ["Build artifacts", "Environment differences", "Owners", "Monitoring and rollback entry point"],
    deliverables: ["Release checklist", "Stop/rollback thresholds", "Monitoring ownership", "Retrospective actions"],
    acceptance: ["Configuration and migrations are verifiable", "Rollback steps are executable", "Someone observes user outcomes after launch"],
    stopConditions: ["No recoverable version exists", "Production credentials or owners are missing", "A high-risk acceptance gate has failed"],
    fields: {
      releaseScope: { label: "Release scope", description: "Version, feature, data, and configuration changes.", example: "First public site, enquiry form, and domain cutover; no legacy-user migration" },
      rollbackPlan: { label: "Rollback plan", description: "Trigger, owner, steps, and data handling.", example: "Rollback to the previous build if form success drops or 5xx errors persist for five minutes" },
      monitoringPlan: { label: "Launch observation", description: "What is monitored, by whom, and for how long.", example: "Developer watches errors and latency for two hours; operations checks forms and content for 24 hours" },
    },
    executionSteps: ["Check all blocking gates", "Confirm backups, rollback, and owners", "Release in stages and observe", "Roll back immediately at a stop threshold", "Record facts, impact, cause, and improvements"],
  },
};

function localizedStages(): StageDefinition[] {
  return STAGES.map((stage) => {
    const copy = STAGE_EN[stage.id];
    if (!copy) throw new Error(`Missing English stage translation: ${stage.id}`);
    return {
      ...stage,
      title: copy.title,
      plainGoal: copy.plainGoal,
      deliverables: copy.deliverables,
      gates: stage.gates.map((gate) => {
        const translated = copy.gates[gate.id];
        if (!translated) throw new Error(`Missing English gate translation: ${stage.id}/${gate.id}`);
        return { ...gate, ...translated };
      }),
    };
  });
}

function localizedPrompts(): PromptTemplate[] {
  return PROMPT_TEMPLATES.map((template) => {
    const copy = PROMPT_EN[template.id];
    if (!copy) throw new Error(`Missing English prompt translation: ${template.id}`);
    return {
      ...template,
      ...copy,
      fields: template.fields.map((field) => {
        const translated = copy.fields[field.id];
        if (!translated) throw new Error(`Missing English prompt field translation: ${template.id}/${field.id}`);
        return { ...field, ...translated };
      }),
    };
  });
}

const ENGLISH_STAGES = localizedStages();
const ENGLISH_PROMPTS = localizedPrompts();

export const STAGE_STATUS_LABELS_EN: Record<keyof typeof STAGE_STATUS_LABELS, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  review: "Awaiting review",
  done: "Done",
  not_applicable: "Not applicable",
};

export function workflowFor(locale: Locale) {
  if (locale === "zh") {
    return {
      websiteTypes: WEBSITE_TYPES,
      startPoints: START_POINTS,
      features: FEATURES,
      contentOwners: CONTENT_OWNERS,
      regions: REGIONS,
      priorities: PRIORITIES,
      stages: STAGES,
      statusLabels: STAGE_STATUS_LABELS,
      promptTemplates: PROMPT_TEMPLATES,
    };
  }
  return {
    websiteTypes: localizeOptions(WEBSITE_TYPES, WEBSITE_TYPE_EN),
    startPoints: localizeOptions(START_POINTS, START_POINT_EN),
    features: localizeOptions(FEATURES, FEATURE_EN),
    contentOwners: localizeOptions(CONTENT_OWNERS, CONTENT_OWNER_EN),
    regions: localizeOptions(REGIONS, REGION_EN),
    priorities: localizeOptions(PRIORITIES, PRIORITY_EN),
    stages: ENGLISH_STAGES,
    statusLabels: STAGE_STATUS_LABELS_EN,
    promptTemplates: ENGLISH_PROMPTS,
  };
}

export function localizedStage(stageId: number, locale: Locale): StageDefinition {
  const stages = workflowFor(locale).stages;
  return stages.find((stage) => stage.id === stageId) ?? stages[0];
}

export function localizedPrompt(promptId: string, locale: Locale): PromptTemplate {
  const prompts = workflowFor(locale).promptTemplates;
  return prompts.find((prompt) => prompt.id === promptId) ?? prompts[0];
}
