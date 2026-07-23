import { GLOSSARY, TECHNOLOGIES } from "./knowledge";
import type { GlossaryRecord, Locale, TechnologyRecord } from "./types";

interface TechnologyCopy {
  what: string;
  pros: string[];
  cons: string[];
  chooseWhen: string;
  avoidWhen: string;
}

const TECHNOLOGY_EN: Record<string, TechnologyCopy> = {
  "html-css-js": {
    what: "The browser-native technologies for document structure, presentation, and behavior; every frontend framework ultimately builds on them.",
    pros: ["Standards-based, portable, and dependency-light", "A strong fit for content sites and small interactions", "Makes framework behavior easier to understand"],
    cons: ["Large interfaces need explicit component and state conventions", "Repeated pages can become expensive to maintain"],
    chooseWhen: "The site has few pages, simple interaction, long-term portability needs, or must work as one HTML file.",
    avoidWhen: "A team is building a complex application without component, type, and test conventions.",
  },
  typescript: {
    what: "A statically typed layer over JavaScript that compiles to JavaScript.",
    pros: ["Finds many data-shape and interface errors earlier", "Improves editor feedback", "Provides fast feedback after AI-generated changes"],
    cons: ["Adds configuration and type-modeling work", "Passing type checks does not prove business correctness"],
    chooseWhen: "The project will evolve, has multiple contributors, or relies on important data contracts.",
    avoidWhen: "A tiny throwaway script has no build step and type setup costs more than it saves.",
  },
  "git-github": {
    what: "Git records code history; GitHub hosts repositories and supports collaboration, review, and automation.",
    pros: ["Changes are traceable and recoverable", "AI changes can be reviewed as diffs", "Branches, pull requests, and CI are supported"],
    cons: ["Committed secrets persist in history", "Branches and conflicts require basic operating discipline"],
    chooseWhen: "Any website will be maintained, shared, reviewed, or deployed over time.",
    avoidWhen: "Version control should generally not be skipped, even for a solo project.",
  },
  astro: {
    what: "A content-focused web framework that sends little JavaScript by default and adds interactive components where needed.",
    pros: ["Well suited to company sites, blogs, and documentation", "Produces straightforward static output", "Can adopt React or Vue components incrementally"],
    cons: ["Complex application state is not its primary strength", "Teams still need to understand builds and content models"],
    chooseWhen: "Content, performance, and code ownership matter more than extensive application state.",
    avoidWhen: "The product depends on extensive signed-in state, real-time behavior, or a unified React application ecosystem.",
  },
  nextjs: {
    what: "A React framework with routing, rendering, data access, and server capabilities.",
    pros: ["A broad React ecosystem", "Static and dynamic pages can coexist", "Can grow into a full web application"],
    cons: ["More concepts and deployment surface than a static site", "Poor data boundaries can spread complexity across client and server"],
    chooseWhen: "The project needs sign-in, server logic, dynamic data, or a React-experienced team.",
    avoidWhen: "The site contains only a few stable content pages or operators require fully visual editing.",
  },
  react: {
    what: "A JavaScript library for building user interfaces from components.",
    pros: ["Large component ecosystem", "Strong for complex interactions", "Compatible with many frameworks and design systems"],
    cons: ["Not a complete website architecture", "Routing, data, state, and performance still need engineering decisions"],
    chooseWhen: "The interface is interactive, the team knows React, or the chosen framework uses React.",
    avoidWhen: "A static page needs no client runtime or React is being added only because it is popular.",
  },
  "vue-nuxt": {
    what: "Vue is a progressive UI framework; Nuxt adds full application and server-rendering conventions.",
    pros: ["Templates are approachable for many newcomers", "Supports a path from small interactions to full apps", "Nuxt supplies useful conventions"],
    cons: ["React components and talent are not directly interchangeable", "State, server, and deployment boundaries still require care"],
    chooseWhen: "The team knows Vue or the existing component and content system uses Vue/Nuxt.",
    avoidWhen: "The team and dependencies are React-based and the switch is only experimental.",
  },
  vite: {
    what: "A modern frontend development server and build tool used by multiple frameworks.",
    pros: ["Fast development feedback", "Mature configuration ecosystem", "Useful for static frontends and component applications"],
    cons: ["It is not routing, a CMS, or a backend", "Choosing Vite does not choose the application architecture"],
    chooseWhen: "A lightweight frontend build, framework template, or library-development setup is needed.",
    avoidWhen: "It is being treated as a complete solution for content, data, and deployment.",
  },
  tailwind: {
    what: "A CSS framework for composing styles from utility classes in markup.",
    pros: ["Centralized design tokens and responsive conventions", "Fast style iteration inside components", "Works well with explicit component boundaries"],
    cons: ["Markup can become class-dense", "Inconsistency remains possible without design constraints", "It does not replace semantic HTML or accessibility"],
    chooseWhen: "The team accepts utility classes and maintains component and token conventions.",
    avoidWhen: "Content authors edit raw HTML directly or the project needs very little styling.",
  },
  shadcn: {
    what: "A component distribution approach that copies editable component source into a project.",
    pros: ["High source-code ownership", "A fast React UI baseline", "Components can be deeply adapted to brand and business needs"],
    cons: ["The project owns maintenance after copying", "Default-looking interfaces are common", "Content and flow design remain necessary"],
    chooseWhen: "A React project needs editable starter components and can maintain their source.",
    avoidWhen: "The project is not React-based or expects a vendor to manage component upgrades completely.",
  },
  wordpress: {
    what: "An open-source content management system extended through themes and plugins.",
    pros: ["Mature editorial administration", "Widely available operator experience", "Large ecosystem"],
    cons: ["Themes and plugins expand the security and maintenance surface", "Performance and consistency depend on combination quality", "Heavy customization can accumulate debt"],
    chooseWhen: "Operators update content frequently and the team can maintain WordPress.",
    avoidWhen: "Minimal maintenance and attack surface are priorities, or application logic does not fit a plugin model.",
  },
  webflow: {
    what: "A commercial website platform combining visual design, CMS features, and hosting.",
    pros: ["Design and publishing are integrated", "Operators can edit directly", "Marketing sites can iterate quickly"],
    cons: ["Platform capabilities, prices, and export boundaries can change", "Complex business logic is constrained", "Migration needs advance verification"],
    chooseWhen: "Visual editing and rapid marketing publishing matter more than complete code control.",
    avoidWhen: "The core product requires complex permissions, transactions, or a highly portable backend.",
  },
  framer: {
    what: "A visual website builder and hosted publishing platform oriented toward design-led marketing sites.",
    pros: ["Fast visual iteration", "Integrated hosting and publishing", "Useful for small marketing teams"],
    cons: ["Platform and pricing boundaries can change", "Complex application logic is limited", "Portability should be verified before commitment"],
    chooseWhen: "A design-heavy landing page or portfolio must launch quickly with visual editing.",
    avoidWhen: "The site needs complex data, permissions, or a backend that must remain platform-independent.",
  },
  shopify: {
    what: "A managed commerce platform for storefronts, products, orders, payments, and operations.",
    pros: ["Reuses mature commerce infrastructure", "Large theme and app ecosystem", "Operations tooling is built in"],
    cons: ["Fees, apps, and platform rules affect cost and control", "Custom workflows can require significant integration", "Regional capabilities need verification"],
    chooseWhen: "The primary requirement is selling products without building a transaction system from scratch.",
    avoidWhen: "The business model cannot fit platform product, order, or fulfillment rules.",
  },
  supabase: {
    what: "A managed backend platform built around PostgreSQL with authentication, storage, realtime, and server functions.",
    pros: ["Speeds up common backend setup", "Uses PostgreSQL rather than a proprietary database model", "Local and hosted workflows are available"],
    cons: ["Permissions and row-level security still require careful design", "A managed service does not remove operations responsibility", "Costs and limits change"],
    chooseWhen: "A small team needs a PostgreSQL-based backend with common platform services.",
    avoidWhen: "The team cannot own authorization, data modeling, migration, and production recovery.",
  },
  postgresql: {
    what: "An open-source relational database with transactions, constraints, indexing, and a large extension ecosystem.",
    pros: ["Strong data integrity and query capability", "Portable across many hosts", "Fits structured business data"],
    cons: ["Schema, indexes, backups, and migrations require expertise", "It is not a complete application backend"],
    chooseWhen: "The system has durable structured data, relationships, and transactional rules.",
    avoidWhen: "No server-side state is needed or the team cannot operate a production database.",
  },
  vercel: {
    what: "A managed deployment platform for frontend frameworks, static assets, and server functions.",
    pros: ["Fast Git-based deployments", "Good integration with common frontend frameworks", "Preview deployments support review"],
    cons: ["Prices, limits, and runtime behavior can change", "Architecture can become vendor-specific", "Regional requirements need validation"],
    chooseWhen: "The project benefits from managed frontend deployment and preview environments.",
    avoidWhen: "Strict infrastructure portability or unsupported regional requirements are hard constraints.",
  },
  cloudflare: {
    what: "Cloudflare Pages hosts web frontends, while Workers runs code on Cloudflare's distributed platform.",
    pros: ["Global edge delivery", "Static hosting and serverless logic can share a platform", "Security and network services are available"],
    cons: ["Worker runtime constraints differ from a conventional server", "Platform configuration adds complexity", "Regional behavior requires direct testing"],
    chooseWhen: "Global edge delivery or lightweight edge logic is valuable and the runtime fits.",
    avoidWhen: "The application depends on unsupported Node behavior or a conventional long-running server.",
  },
  netlify: {
    what: "A managed platform for static sites, frontend deployments, functions, and previews.",
    pros: ["Straightforward Git-based publishing", "Preview deployments", "Common frontend workflows are integrated"],
    cons: ["Limits, prices, and features change", "Functions and add-ons can create platform coupling", "Not every backend workload fits"],
    chooseWhen: "A static or frontend-focused site needs managed deployment and previews.",
    avoidWhen: "The project needs infrastructure control or backend behavior outside the platform model.",
  },
  "github-pages": {
    what: "Static website hosting served from a GitHub repository or Actions build.",
    pros: ["Simple for public static projects", "Works directly with repository workflows", "No application server is required"],
    cons: ["Static files only", "Public URLs are accessible to anyone who knows them", "No private application data layer is provided"],
    chooseWhen: "The output is fully static and public access is acceptable.",
    avoidWhen: "The site requires private access, server secrets, dynamic APIs, or server-side user data.",
  },
  playwright: {
    what: "A browser-automation and end-to-end testing framework for Chromium, Firefox, and WebKit.",
    pros: ["Tests realistic user flows", "Supports screenshots and traces", "Useful across multiple browser engines"],
    cons: ["End-to-end tests cost more to maintain than unit tests", "Unstable selectors and environments can create flakes"],
    chooseWhen: "Critical browser journeys and regressions need repeatable evidence.",
    avoidWhen: "A small pure function is better covered by a fast unit test.",
  },
  lighthouse: {
    what: "An automated audit tool for selected performance, accessibility, best-practice, and SEO checks.",
    pros: ["Fast repeatable baseline", "Provides diagnostic detail", "Useful in local and CI workflows"],
    cons: ["Scores vary by environment", "Automated checks cover only part of accessibility and user experience"],
    chooseWhen: "A repeatable diagnostic baseline is needed and results are interpreted with context.",
    avoidWhen: "A single score is being treated as proof of compliance or real-user quality.",
  },
  sentry: {
    what: "A hosted observability product for errors, performance traces, releases, and related diagnostics.",
    pros: ["Connects production errors to releases and context", "Supports alerting and issue triage", "Client and server SDKs are available"],
    cons: ["Telemetry can contain sensitive data without careful filtering", "Sampling, retention, and cost need governance", "It adds a third-party dependency"],
    chooseWhen: "A dynamic site needs production error visibility and the data policy is configured.",
    avoidWhen: "Telemetry privacy, retention, and ownership have not been reviewed.",
  },
  "github-actions": {
    what: "GitHub's repository automation service for workflows such as tests, builds, and deployments.",
    pros: ["Runs checks next to repository changes", "Large action ecosystem", "Supports protected release workflows"],
    cons: ["Third-party actions and tokens expand supply-chain risk", "Workflow permissions require careful scoping"],
    chooseWhen: "Repository events should trigger repeatable verification or deployment.",
    avoidWhen: "Workflow permissions and third-party action references have not been reviewed.",
  },
  codex: {
    what: "An AI coding agent that can inspect a repository, edit code, run commands, and collaborate on engineering tasks within granted boundaries.",
    pros: ["Can connect implementation with repository context and verification", "Useful for scoped changes, reviews, and debugging", "Can preserve an auditable code diff"],
    cons: ["It can be wrong or overreach without clear scope and tests", "It cannot supply missing business authority or private facts", "External writes still require explicit authorization"],
    chooseWhen: "The task, repository boundary, relevant context, and verification path are clear.",
    avoidWhen: "The request depends on unverified business facts, missing authority, or secrets placed in prompts.",
  },
};

const CATEGORY_EN: Record<string, string> = {
  "Web 基础": "Web fundamentals",
  工程基础: "Engineering fundamentals",
  前端框架: "Frontend framework",
  前端库: "Frontend library",
  构建工具: "Build tooling",
  样式系统: "Styling system",
  组件方案: "Component approach",
  "CMS / 建站": "CMS / website platform",
  可视化建站: "Visual website builder",
  电商: "E-commerce",
  后端服务: "Backend service",
  数据库: "Database",
  托管与部署: "Hosting and deployment",
  测试与质量: "Testing and quality",
  监控与运维: "Monitoring and operations",
  工程自动化: "Engineering automation",
  "AI 编程": "AI coding",
  需求与设计: "Requirements and design",
  "AI 工程": "AI engineering",
  架构: "Architecture",
  内容与信息架构: "Content and information architecture",
  前端: "Frontend",
  质量: "Quality",
  内容与增长: "Content and growth",
  发布与网络: "Release and networking",
  安全: "Security",
  数据: "Data",
  工程化: "Engineering",
  测试: "Testing",
  发布与运维: "Release and operations",
};

type GlossaryCopy = [term: string, definition: string, whyItMatters: string];

const GLOSSARY_EN: Record<string, GlossaryCopy> = {
  spec: ["Spec", "A written agreement describing the problem, scope, constraints, behavior, and acceptance criteria.", "It gives AI a testable target and reduces accidental scope expansion."],
  sdd: ["SDD (Spec-Driven Development in this guide)", "A workflow in which an explicit specification guides implementation and verification.", "The phrase is used in different ways, so this guide states its intended meaning."],
  "vibe-coding": ["Vibe Coding", "An informal term for building software by directing AI mainly through natural-language conversation.", "Fast generation still needs requirements, review, testing, and accountable decisions."],
  prd: ["PRD", "A product requirements document describing users, goals, requirements, constraints, and success criteria.", "It can turn loose requests into reviewable product decisions before code is changed."],
  adr: ["ADR", "An architecture decision record that captures a decision, context, alternatives, and consequences.", "It preserves why a technology choice was made and when it should be revisited."],
  sitemap: ["Sitemap", "A model of the pages or content areas of a site and how they relate.", "It prevents navigation and page count from being invented during implementation."],
  wireframe: ["Wireframe", "A low-fidelity layout showing content hierarchy and interaction without final visual styling.", "It lets teams test structure before investing in polish."],
  prototype: ["Prototype", "A representation used to explore or test a product idea, flow, or interaction before production implementation.", "It exposes misunderstandings while changes are still cheap."],
  "design-system": ["Design System", "A maintained collection of design principles, tokens, components, and usage guidance.", "It helps AI-generated pages remain consistent and accessible across the product."],
  component: ["Component", "A reusable, bounded unit of user interface and behavior.", "Clear components help scope AI changes and reduce repeated implementation."],
  responsive: ["Responsive Web Design", "An approach that adapts layout and content to different screens and user settings.", "A desktop screenshot does not prove the site works on phones, zoomed views, or narrow windows."],
  "semantic-html": ["Semantic HTML", "HTML elements chosen for their meaning and structure rather than appearance alone.", "Good semantics improve accessibility, maintainability, and machine understanding."],
  accessibility: ["Accessibility", "The practice of making products usable by people with a wide range of abilities and assistive technologies.", "It requires real interaction checks; visual inspection and AI output alone are insufficient."],
  wcag: ["WCAG", "The Web Content Accessibility Guidelines published by W3C, organized around testable success criteria.", "They provide a shared accessibility reference, but automated scans cannot prove full conformance."],
  seo: ["SEO", "Work that helps search engines crawl, understand, and present useful web content.", "Technical markup cannot compensate for inaccurate, thin, or unsourced content."],
  geo: ["GEO (Generative Engine Optimization)", "An emerging, informal label for making content easier for generative search or answer systems to understand and cite.", "The term and practices are evolving; clear structure and sourced facts are safer than unverified ranking claims."],
  domain: ["Domain Name", "A human-readable name mapped through DNS to internet services.", "Domain ownership and access are release-critical assets that should not depend on one developer's account."],
  dns: ["DNS", "The distributed system that maps domain names to records used by internet services.", "A deployment is not complete until DNS, certificates, rollback, and ownership are verified."],
  hosting: ["Hosting", "Infrastructure or a managed service that serves a website or application.", "Hosting determines runtime capabilities, access model, regions, cost, and operational responsibility."],
  cdn: ["CDN", "A distributed network that caches or serves content closer to users.", "It can improve delivery, but cache behavior, regions, and invalidation need testing."],
  https: ["HTTPS / TLS", "HTTP protected in transit with TLS, normally authenticated by a certificate.", "It is essential for user trust and secure transport, but does not make an application secure by itself."],
  pwa: ["PWA", "A web application that uses web capabilities such as a manifest and service worker to provide installable or resilient experiences.", "Offline and install behavior must be designed and tested rather than inferred from the presence of a manifest."],
  "service-worker": ["Service Worker", "A browser worker that can intercept requests and support caching, offline behavior, and background features.", "A stale or overly broad cache can serve outdated code, so update and fallback behavior need tests."],
  api: ["API", "An interface through which software systems or components exchange requests and data.", "AI needs explicit contracts, errors, authentication, and data boundaries to integrate an API safely."],
  rest: ["REST", "An architectural style for networked systems based on resources and standard HTTP semantics.", "Calling an endpoint REST does not define its authorization, errors, versioning, or idempotency."],
  authn: ["Authentication", "The process of establishing who a user or system is.", "Sign-in introduces account recovery, session, abuse, and privacy responsibilities."],
  authz: ["Authorization", "The decision about what an authenticated or anonymous actor may access or change.", "A working login does not prove permissions are enforced on every server-side operation."],
  session: ["Session", "Server and client state used to associate a sequence of requests with an authenticated or ongoing interaction.", "Expiration, renewal, revocation, storage, and theft risks must be designed explicitly."],
  cookie: ["Cookie", "A small value associated with a website that a browser stores and sends according to defined attributes.", "Security, privacy, consent, and cross-site behavior depend on how the cookie is configured and used."],
  "local-storage": ["localStorage", "Browser storage scoped to an origin and retained until code or the user clears it.", "It survives closing a page, but is device/browser-specific and is not safe storage for secrets."],
  database: ["Database", "A system for storing, organizing, querying, and protecting persistent data.", "Choosing one creates schema, migration, backup, authorization, and recovery responsibilities."],
  schema: ["Schema", "A formal description of data structure, types, relationships, or validation rules.", "It gives AI and code an explicit contract instead of guessing data shapes."],
  migration: ["Database Migration", "A controlled change to database structure or data between versions.", "Production changes need compatibility, backup, rollback, and verification plans."],
  "ci-cd": ["CI / CD", "Automation that integrates changes through repeatable checks and prepares or performs delivery.", "It makes quality and deployment steps reproducible, but permissions and release approval remain important."],
  lint: ["Lint", "Static analysis that flags selected code-quality, correctness, or style patterns.", "It provides fast feedback but does not replace type, test, security, or product review."],
  "type-check": ["Type Checking", "Analysis that verifies values and operations against declared or inferred types.", "It catches many integration mistakes but cannot prove the business behavior is correct."],
  "unit-test": ["Unit Test", "A focused test of a small unit of behavior with controlled dependencies.", "It gives fast feedback for logic but cannot prove a real browser journey works."],
  "integration-test": ["Integration Test", "A test that verifies multiple components or systems work together at a defined boundary.", "It catches contract and configuration failures that isolated tests miss."],
  e2e: ["End-to-End Test", "A test that exercises a user journey through the assembled system.", "It provides valuable release evidence but should focus on critical paths to control maintenance cost."],
  uat: ["UAT", "User acceptance testing in which responsible business users evaluate the product against agreed criteria.", "AI and developers cannot approve business correctness on behalf of the accountable owner."],
  "vertical-slice": ["Vertical Slice", "A small piece of work that delivers one user outcome across the necessary interface, logic, and data boundaries.", "It keeps AI work reviewable and produces usable evidence sooner than layer-by-layer implementation."],
  mvp: ["MVP", "The minimum product needed to test a value hypothesis with real users or evidence.", "It is not an excuse for unsafe or unverifiable work; minimum scope still needs minimum quality."],
  rollback: ["Rollback", "Returning a release or configuration to a previously working state.", "A release is not safely reversible until triggers, steps, data handling, and owners are tested."],
  observability: ["Observability", "The ability to understand a system's internal state from outputs such as logs, metrics, traces, and events.", "It supports diagnosis of failures that were not predicted in advance."],
  monitoring: ["Monitoring", "Ongoing checks of known signals, thresholds, and expected behavior.", "Someone must own alerts and user-impact checks after deployment."],
  slo: ["SLO / SLA", "An SLO is an internal reliability target; an SLA is a formal service commitment that may include consequences.", "Reliability language should use measured windows and explicit ownership instead of vague claims."],
  "rpo-rto": ["RPO / RTO", "RPO limits acceptable data loss in time; RTO limits acceptable recovery time.", "They turn backup and recovery from “we have backups” into testable objectives."],
  "feature-flag": ["Feature Flag", "A controlled switch that changes feature availability without requiring a new code deployment.", "Flags can reduce release risk but need ownership, cleanup, and authorization rules."],
  csp: ["CSP", "Content Security Policy is a browser security mechanism that restricts permitted content sources and behaviors.", "It can reduce some injection impact but requires careful configuration and testing."],
  cors: ["CORS", "A browser mechanism through which a server declares which other origins may read selected responses.", "It is not authentication and does not stop direct server requests."],
  secret: ["Secret", "A credential or sensitive value that grants access, such as an API key, password, token, or private key.", "Secrets must stay out of prompts, public code, client bundles, logs, and screenshots."],
  "environment-variable": ["Environment Variable", "A named value supplied to a process outside its source code.", "It can separate configuration from code, but client-exposed variables are still public and secret storage needs controls."],
  dependency: ["Dependency", "External code or a service on which a project relies.", "Every dependency adds maintenance, licensing, security, and availability considerations."],
  "package-manager": ["Package Manager", "A tool that resolves, installs, locks, and updates software packages.", "Lockfiles and reviewed install commands make environments more reproducible and reduce supply-chain ambiguity."],
  "ssr-ssg-csr": ["SSR / SSG / CSR", "Server-side rendering creates HTML per request, static generation creates it ahead of time, and client-side rendering creates much of it in the browser.", "The choice affects hosting, caching, interactivity, failure modes, and how content is delivered."],
  "headless-cms": ["Headless CMS", "A content system that exposes content through an API while a separate frontend renders it.", "It separates editorial work from presentation but adds modeling, integration, preview, and migration responsibilities."],
  webhook: ["Webhook", "An HTTP callback sent when an event occurs in another system.", "Delivery can be duplicated, delayed, forged, or fail, so verification, retries, and idempotency matter."],
  "rate-limit": ["Rate Limiting", "A control that limits actions or requests over a period or resource boundary.", "It helps manage abuse and capacity but must be enforced at the correct trusted boundary."],
  idempotency: ["Idempotency", "A property that lets the same operation be repeated without unintended additional effects.", "It is critical for retries in payments, orders, webhooks, and unreliable networks."],
  "core-web-vitals": ["Core Web Vitals", "A set of Google-defined user-experience metrics for loading, interaction responsiveness, and visual stability.", "They are useful observed indicators, not a complete measure of site quality or search performance."],
  "performance-budget": ["Performance Budget", "An explicit limit for assets, timings, or user-experience metrics that a release should not exceed.", "It turns performance into a testable constraint before regressions reach production."],
};

function englishTechnologies(): TechnologyRecord[] {
  return TECHNOLOGIES.map((item) => {
    const copy = TECHNOLOGY_EN[item.id];
    if (!copy) throw new Error(`Missing English technology translation: ${item.id}`);
    return {
      ...item,
      ...copy,
      category: CATEGORY_EN[item.category] ?? item.category,
      source: { ...item.source, label: `${item.name} documentation` },
    };
  });
}

function englishGlossary(): GlossaryRecord[] {
  return GLOSSARY.map((item) => {
    const copy = GLOSSARY_EN[item.id];
    if (!copy) throw new Error(`Missing English glossary translation: ${item.id}`);
    return {
      ...item,
      term: copy[0],
      aliases: item.aliases?.filter((alias) => !/[\u3400-\u9fff]/u.test(alias)),
      category: CATEGORY_EN[item.category] ?? item.category,
      definition: copy[1],
      whyItMatters: copy[2],
      source: { ...item.source, label: "Reference source" },
    };
  });
}

const TECHNOLOGIES_EN = englishTechnologies();
const GLOSSARY_RECORDS_EN = englishGlossary();

export function knowledgeFor(locale: Locale): {
  technologies: TechnologyRecord[];
  glossary: GlossaryRecord[];
} {
  return locale === "en"
    ? { technologies: TECHNOLOGIES_EN, glossary: GLOSSARY_RECORDS_EN }
    : { technologies: TECHNOLOGIES, glossary: GLOSSARY };
}
