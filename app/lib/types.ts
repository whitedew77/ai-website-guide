export type WebsiteTypeId =
  | "corporate"
  | "landing"
  | "portfolio"
  | "blog"
  | "app"
  | "ecommerce"
  | "internal";

export type StartPointId =
  | "idea"
  | "materials"
  | "design"
  | "code"
  | "live";

export type FeatureId =
  | "login"
  | "permissions"
  | "personal-data"
  | "upload"
  | "payment";

export type ContentOwnerId = "self-ai" | "developer" | "operator" | "approval";
export type RegionId = "mainland" | "global" | "both";
export type PriorityId =
  | "speed"
  | "cost"
  | "ownership"
  | "visual-editing"
  | "scale";

export type RiskLevel = "low" | "medium" | "high";
export type StageStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "review"
  | "done"
  | "not_applicable";

export interface ProjectAnswers {
  websiteType: WebsiteTypeId;
  startPoint: StartPointId;
  features: FeatureId[];
  contentOwner: ContentOwnerId;
  region: RegionId;
  priority: PriorityId;
}

export interface RouteOption {
  title: string;
  stack: string;
  why: string;
  avoidWhen: string;
}

export interface RouteRecommendation {
  risk: RiskLevel;
  riskReasons: string[];
  primary: RouteOption;
  simple: RouteOption;
  scalable: RouteOption;
  constraints: string[];
  today: string[];
}

export interface GateDefinition {
  id: string;
  title: string;
  help: string;
  evidenceExample: string;
  appliesTo?: WebsiteTypeId[];
  requiresAnyFeature?: FeatureId[];
  regions?: RegionId[];
  riskLevels?: RiskLevel[];
}

export interface StageDefinition {
  id: number;
  title: string;
  plainGoal: string;
  deliverables: string[];
  promptIds: string[];
  gates: GateDefinition[];
}

export interface GateProgress {
  passed: boolean;
  evidence: string;
  updatedAt?: string;
}

export interface StageProgress {
  status: StageStatus;
  notApplicableReason: string;
  blocker: string;
  gates: Record<string, GateProgress>;
}

export interface PromptDraft {
  values: Record<string, string>;
  unknowns: string[];
  updatedAt: string;
}

export interface WebsiteProject {
  schemaVersion: 2;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  answers: ProjectAnswers;
  recommendation: RouteRecommendation;
  stages: Record<string, StageProgress>;
  promptDrafts: Record<string, PromptDraft>;
}

export interface PromptField {
  id: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
  multiline?: boolean;
  sensitiveWarning?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  stageIds: number[];
  when: string;
  preparation: string[];
  deliverables: string[];
  acceptance: string[];
  stopConditions: string[];
  fields: PromptField[];
  executionSteps: string[];
}

export interface TechnologyRecord {
  id: string;
  name: string;
  category: string;
  level: "core" | "advanced";
  what: string;
  pros: string[];
  cons: string[];
  chooseWhen: string;
  avoidWhen: string;
  source: { label: string; url: string };
  reviewedAt: string;
  volatility: "stable" | "changing";
  claimType: "fact" | "engineering-judgment";
}

export interface GlossaryRecord {
  id: string;
  term: string;
  aliases?: string[];
  level: "core" | "advanced";
  category: string;
  definition: string;
  whyItMatters: string;
  source: { label: string; url: string };
  reviewedAt: string;
  volatility: "stable" | "changing";
  claimType: "fact" | "engineering-judgment" | "informal";
}

export interface SkillScore {
  fit: number;
  maintenance: number;
  safety: number;
  clarity: number;
  portability: number;
  popularity: number;
}

export interface SkillRecord {
  id: string;
  name: string;
  tier: "core" | "conditional" | "study";
  repo: string;
  path: string;
  ref: string;
  publisher: string;
  license: string;
  stageIds: number[];
  purpose: string;
  limitations: string;
  permissions: string[];
  risk: "low" | "medium" | "high";
  installType: "codex-skill" | "codex-plugin" | "study-only";
  installCommand?: string;
  installNote: string;
  sourceUrl: string;
  reviewedAt: string;
  maintenanceNote: string;
  issueReleaseNote: string;
  score: SkillScore;
}

export interface ReviewedSkillCatalog {
  schemaVersion: 1;
  catalogVersion: string;
  reviewedAt: string;
  reviewStatus: "reviewed";
  skills: SkillRecord[];
}

export interface LocalInventory {
  schemaVersion: 1;
  generatedAt: string;
  source: "local-readonly-scan";
  skills: Array<{ name: string; path?: string; sourceKind?: string }>;
}
