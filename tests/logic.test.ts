import assert from "node:assert/strict";
import test from "node:test";
import { GLOSSARY, TECHNOLOGIES } from "../app/lib/knowledge";
import { localeFromBrowser, localeFromSearch } from "../app/lib/i18n";
import { knowledgeFor } from "../app/lib/localized-knowledge";
import { localizeCatalog } from "../app/lib/localized-skills";
import { workflowFor } from "../app/lib/localized-workflow";
import {
  applicableGates,
  composePrompt,
  createProject,
  gateIsPassed,
  missingPromptFields,
  projectProgress,
  promptDefaults,
  recommendationFor,
  validateImportedProject,
} from "../app/lib/logic";
import { REVIEWED_SKILL_CATALOG } from "../app/lib/skills";
import type { ProjectAnswers } from "../app/lib/types";
import { PROMPT_TEMPLATES, STAGES, WEBSITE_TYPES } from "../app/lib/workflow-content";

const baseAnswers: ProjectAnswers = {
  websiteType: "corporate",
  startPoint: "idea",
  features: [],
  contentOwner: "self-ai",
  region: "global",
  priority: "ownership",
};

test("all seven website types receive three distinct route levels", () => {
  assert.equal(WEBSITE_TYPES.length, 7);
  for (const type of WEBSITE_TYPES) {
    const result = recommendationFor({ ...baseAnswers, websiteType: type.id });
    assert.ok(result.primary.stack);
    assert.ok(result.simple.stack);
    assert.ok(result.scalable.stack);
    assert.notEqual(result.primary.title, result.simple.title);
  }
});

test("mainland region adds constraints without overwriting the selected stack", () => {
  const global = recommendationFor(baseAnswers);
  const mainland = recommendationFor({ ...baseAnswers, region: "mainland" });
  assert.equal(mainland.primary.stack, global.primary.stack);
  assert.ok(mainland.constraints.some((item) => item.includes("附加约束")));
});

test("existing work is inferred as review, never auto-completed", () => {
  const project = createProject("虚构项目", { ...baseAnswers, startPoint: "code" }, "test-project");
  assert.equal(project.stages["1"].status, "review");
  assert.equal(project.stages["4"].status, "review");
  assert.equal(project.stages["5"].status, "in_progress");
  assert.equal(project.stages["1"].gates.goal.passed, false);
});

test("quality gates are conditional by website type and risk", () => {
  const low = createProject("低风险", baseAnswers, "low");
  const high = createProject(
    "高风险",
    { ...baseAnswers, websiteType: "ecommerce", features: ["payment", "personal-data"] },
    "high",
  );
  const lowTotal = projectProgress(low).total;
  const highTotal = projectProgress(high).total;
  assert.ok(highTotal > lowTotal);
  assert.ok(applicableGates(high, STAGES[2]).some((gate) => gate.id === "commerce-rules"));
  assert.ok(applicableGates(high, STAGES[6]).some((gate) => gate.id === "security-test"));
});

test("a gate only passes when both evidence and approval exist", () => {
  assert.equal(gateIsPassed({ passed: true, evidence: "" }), false);
  assert.equal(gateIsPassed({ passed: false, evidence: "评审记录" }), false);
  assert.equal(gateIsPassed({ passed: true, evidence: "评审记录" }), true);
});

test("prompt generator blocks missing fields and turns unknowns into questions", () => {
  const project = createProject("虚构咖啡网站", baseAnswers, "prompt");
  const template = PROMPT_TEMPLATES[0];
  const defaults = promptDefaults(project, template);
  const missing = missingPromptFields(template, defaults, ["audience", "businessGoal"]);
  assert.deepEqual(missing, []);
  const prompt = composePrompt(project, template, defaults, ["audience", "businessGoal"]);
  assert.match(prompt, /请先追问，不得猜测/);
  assert.doesNotMatch(prompt, /\{\{[^}]+\}\}|<<[^>]+>>/);
});

test("import rejects unsupported project schema", () => {
  assert.throws(() => validateImportedProject({ schemaVersion: 1 }), /版本不受支持/);
});

test("project JSON round-trips without losing evidence or prompt drafts", () => {
  const project = createProject("换机测试（虚构）", baseAnswers, "portable-project");
  project.stages["1"].gates.goal.evidence = "已确认的目标与非目标";
  project.stages["1"].gates.goal.passed = true;
  project.promptDrafts["project-kickoff"] = {
    values: { projectName: project.name },
    unknowns: ["audience"],
    updatedAt: "2026-07-20T00:00:00.000Z",
  };
  const restored = validateImportedProject(JSON.parse(JSON.stringify(project)));
  assert.equal(restored.stages["1"].gates.goal.evidence, "已确认的目标与非目标");
  assert.deepEqual(restored.promptDrafts["project-kickoff"].unknowns, ["audience"]);
});

test("not-applicable stages are excluded only after a reason is recorded", () => {
  const project = createProject("不适用测试（虚构）", baseAnswers, "na-project");
  const initialTotal = projectProgress(project).total;
  project.stages["8"].status = "not_applicable";
  assert.equal(projectProgress(project).total, initialTotal);
  project.stages["8"].notApplicableReason = "本项目只交付本地原型，经委托方确认不发布。";
  assert.ok(projectProgress(project).total < initialTotal);
});

test("knowledge and Skill records include sources and review dates", () => {
  assert.ok(TECHNOLOGIES.length >= 20);
  assert.ok(GLOSSARY.length >= 45);
  assert.ok(TECHNOLOGIES.every((item) => item.source.url.startsWith("https://") && item.reviewedAt));
  assert.ok(GLOSSARY.every((item) => item.source.url.startsWith("https://") && item.reviewedAt));
  const core = REVIEWED_SKILL_CATALOG.skills.filter((item) => item.tier === "core");
  assert.ok(core.length <= 12);
  assert.ok(REVIEWED_SKILL_CATALOG.skills.every((item) => item.repo && item.path && item.ref && item.reviewedAt));
  assert.ok(REVIEWED_SKILL_CATALOG.skills.every((item) => item.maintenanceNote && item.issueReleaseNote));
});

test("English content mirrors every reviewed Chinese content record", () => {
  const englishWorkflow = workflowFor("en");
  const englishKnowledge = knowledgeFor("en");
  const englishCatalog = localizeCatalog(REVIEWED_SKILL_CATALOG, "en");
  assert.deepEqual(englishWorkflow.stages.map((item) => item.id), STAGES.map((item) => item.id));
  assert.deepEqual(
    englishWorkflow.promptTemplates.map((item) => item.id),
    PROMPT_TEMPLATES.map((item) => item.id),
  );
  assert.deepEqual(
    englishKnowledge.technologies.map((item) => item.id),
    TECHNOLOGIES.map((item) => item.id),
  );
  assert.deepEqual(
    englishKnowledge.glossary.map((item) => item.id),
    GLOSSARY.map((item) => item.id),
  );
  assert.deepEqual(
    englishCatalog.skills.map((item) => item.id),
    REVIEWED_SKILL_CATALOG.skills.map((item) => item.id),
  );
  const englishCopy = [
    ...englishWorkflow.stages.flatMap((stage) => [
      stage.title,
      stage.plainGoal,
      ...stage.deliverables,
      ...stage.gates.flatMap((gate) => [gate.title, gate.help, gate.evidenceExample]),
    ]),
    ...englishWorkflow.promptTemplates.flatMap((prompt) => [
      prompt.title,
      prompt.when,
      ...prompt.preparation,
      ...prompt.deliverables,
      ...prompt.acceptance,
      ...prompt.stopConditions,
      ...prompt.executionSteps,
      ...prompt.fields.flatMap((field) => [field.label, field.description, field.example]),
    ]),
    ...englishKnowledge.technologies.flatMap((item) => [
      item.category,
      item.what,
      ...item.pros,
      ...item.cons,
      item.chooseWhen,
      item.avoidWhen,
      item.source.label,
    ]),
    ...englishKnowledge.glossary.flatMap((item) => [
      item.term,
      item.category,
      item.definition,
      item.whyItMatters,
      item.source.label,
      ...(item.aliases ?? []),
    ]),
    ...englishCatalog.skills.flatMap((item) => [
      item.name,
      item.purpose,
      item.limitations,
      ...item.permissions,
      item.installNote,
      item.license,
      item.maintenanceNote,
      item.issueReleaseNote,
    ]),
  ].join("\n");
  assert.doesNotMatch(englishCopy, /[\u3400-\u9fff]/u);
});

test("English projects produce an English roadmap summary and prompt", () => {
  const project = createProject(
    "Pine Grove Coffee Website (fictional example)",
    baseAnswers,
    "english-project",
    "en",
  );
  const template = workflowFor("en").promptTemplates[0];
  const defaults = promptDefaults(project, template, "en");
  const prompt = composePrompt(project, template, defaults, ["audience", "businessGoal"], "en");
  assert.match(prompt, /^# Task/m);
  assert.match(prompt, /ask first and do not guess/i);
  assert.match(recommendationFor(baseAnswers, "en").primary.title, /^Primary:/);
  assert.doesNotMatch(prompt, /[\u3400-\u9fff]/u);
});

test("language selection supports query, browser default, and exactly two locales", () => {
  assert.equal(localeFromSearch("?lang=en"), "en");
  assert.equal(localeFromSearch("?lang=zh"), "zh");
  assert.equal(localeFromSearch("?lang=fr"), null);
  assert.equal(localeFromBrowser("zh-Hans-CN"), "zh");
  assert.equal(localeFromBrowser("en-SG"), "en");
  assert.equal(localeFromBrowser("fr-FR"), "en");
});
