import {
  CONTENT_OWNERS,
  FEATURES,
  PRIORITIES,
  STAGES,
  START_POINTS,
  WEBSITE_TYPES,
} from "./workflow-content";
import { workflowFor } from "./localized-workflow";
import type {
  GateDefinition,
  Locale,
  ProjectAnswers,
  PromptDraft,
  PromptTemplate,
  RiskLevel,
  RouteOption,
  RouteRecommendation,
  StageDefinition,
  StageProgress,
  WebsiteProject,
} from "./types";

const nowIso = () => new Date().toISOString();

const route = (title: string, stack: string, why: string, avoidWhen: string): RouteOption => ({
  title,
  stack,
  why,
  avoidWhen,
});

function labelFor<T extends { id: string; label: string }>(items: T[], id: string): string {
  return items.find((item) => item.id === id)?.label ?? id;
}

export function riskForAnswers(answers: ProjectAnswers): { risk: RiskLevel; reasons: string[] } {
  return riskForAnswersInLocale(answers, "zh");
}

export function riskForAnswersInLocale(
  answers: ProjectAnswers,
  locale: Locale,
): { risk: RiskLevel; reasons: string[] } {
  const content = workflowFor(locale);
  const reasons: string[] = [];
  const highRiskFeatures = answers.features.filter((feature) =>
    ["permissions", "personal-data", "upload", "payment"].includes(feature),
  );

  if (highRiskFeatures.length > 0) {
    reasons.push(
      locale === "en"
        ? `Includes ${highRiskFeatures.map((id) => labelFor(content.features, id)).join(", ")} and requires targeted security, privacy, or transaction acceptance.`
        : `包含${highRiskFeatures.map((id) => labelFor(FEATURES, id)).join("、")}，需要安全、隐私或交易专项验收。`,
    );
    return { risk: "high", reasons };
  }

  if (answers.features.includes("login")) {
    reasons.push(
      locale === "en"
        ? "Includes sign-in, so sessions, account recovery, and authorization boundaries need explicit design."
        : "包含登录，需要会话、账号恢复和权限边界设计。",
    );
    return { risk: "high", reasons };
  }

  if (["app", "ecommerce", "internal"].includes(answers.websiteType)) {
    reasons.push(
      locale === "en"
        ? "The website contains durable business state or internal workflows and cannot be accepted as a set of static pages."
        : "网站包含持续性业务状态或内部流程，不能只按静态页面验收。",
    );
    return { risk: "medium", reasons };
  }

  reasons.push(
    locale === "en"
      ? "The current choices are public-content focused and do not declare sign-in, payments, uploads, or personal-data processing."
      : "当前选择以公开内容为主，未声明登录、支付、上传或个人信息处理。",
  );
  return { risk: "low", reasons };
}

function baseRoutes(answers: ProjectAnswers, locale: Locale): {
  primary: RouteOption;
  simple: RouteOption;
  scalable: RouteOption;
} {
  if (locale === "en") return baseRoutesEn(answers);
  const visual = answers.priority === "visual-editing" || ["operator", "approval"].includes(answers.contentOwner);
  const speed = answers.priority === "speed";

  switch (answers.websiteType) {
    case "corporate":
      return {
        primary: visual
          ? route(
              "首选：可视化内容路线",
              "Webflow 或 WordPress + 受控主题/插件",
              "运营能直接维护内容，减少每次更新都依赖开发者。",
              "涉及复杂登录、交易或无法接受平台迁移边界时。",
            )
          : route(
              "首选：内容优先代码路线",
              "Astro + Git + 托管式静态部署",
              "官网以内容和性能为主，代码可迁移，运行面较小。",
              "非技术运营需要每天独立改版，且没有 CMS 时。",
            ),
        simple: route(
          "简化备选",
          speed ? "Framer / Webflow 模板" : "纯 HTML / Astro 静态站",
          "页面少、内容稳定时，可用更少系统快速上线。",
          "需要复杂内容审批、会员或业务数据时。",
        ),
        scalable: route(
          "可扩展备选",
          "Next.js 或 Nuxt + Headless CMS",
          "适合多语言、多人内容和后续动态功能。",
          "只有少量稳定页面时会增加不必要的构建和维护。",
        ),
      };
    case "landing":
      return {
        primary: route(
          "首选：单目标快速路线",
          visual || speed ? "Framer / Webflow" : "Astro / 静态 HTML",
          "围绕单一 CTA 快速制作、测试和替换内容。",
          "需要登录、复杂订单或大量跨页面内容时。",
        ),
        simple: route(
          "简化备选",
          "单页 HTML + 托管表单服务",
          "依赖少，适合短期活动和可控表单。",
          "表单涉及敏感数据或需要复杂 CRM 逻辑时。",
        ),
        scalable: route(
          "可扩展备选",
          "Next.js / Astro + CMS + 实验与分析层",
          "适合长期投放、多版本内容和团队协作。",
          "没有持续实验和运营责任时。",
        ),
      };
    case "portfolio":
      return {
        primary: route(
          "首选：作品内容路线",
          visual ? "Framer / Webflow" : "Astro + 内容集合",
          "案例可结构化复用，视觉与内容都能保持一致。",
          "需要复杂账号或多人审批时。",
        ),
        simple: route(
          "简化备选",
          "静态单页作品集",
          "作品少且更新不频繁时，维护成本最低。",
          "案例需要筛选、搜索、多语言或频繁更新时。",
        ),
        scalable: route(
          "可扩展备选",
          "Astro / Next.js + Headless CMS",
          "适合案例增长、多人编辑和多渠道复用。",
          "当前没有内容运营能力时。",
        ),
      };
    case "blog":
      return {
        primary: visual
          ? route(
              "首选：编辑后台路线",
              "WordPress 或 Headless CMS + 前端",
              "运营可以管理草稿、分类和发布。",
              "无法维护插件安全或 API 集成时。",
            )
          : route(
              "首选：文件内容路线",
              "Astro + Markdown / MDX",
              "内容与代码一起版本控制，静态输出简单。",
              "非技术作者需要复杂审批与可视化编辑时。",
            ),
        simple: route(
          "简化备选",
          "托管博客平台或静态文档模板",
          "先验证持续写作能力，减少自建系统。",
          "品牌、数据所有权或自定义交互是硬要求时。",
        ),
        scalable: route(
          "可扩展备选",
          "Next.js / Nuxt + Headless CMS + 搜索",
          "适合多作者、多语言、结构化内容和产品文档。",
          "文章量少、团队没有内容模型维护能力时。",
        ),
      };
    case "app":
      return {
        primary: route(
          "首选：受控全栈路线",
          "Next.js / Nuxt + PostgreSQL（可用 Supabase 等托管服务）",
          "能覆盖身份、数据、服务端逻辑和持续迭代。",
          "团队没有数据库、权限和上线运维责任人时。",
        ),
        simple: route(
          "简化备选",
          "可丢弃原型 + 托管后端",
          "先验证关键用户任务，再决定生产架构。",
          "已经处理真实敏感数据、收款或对外承诺可用性时。",
        ),
        scalable: route(
          "可扩展备选",
          "模块化 Web 前端 + 独立服务/API + PostgreSQL + 可观测性",
          "适合复杂权限、团队边界和高可靠性需求。",
          "用户与业务尚未验证时，容易过度架构。",
        ),
      };
    case "ecommerce":
      return {
        primary: route(
          "首选：成熟电商平台",
          "Shopify 或目标地区成熟的托管电商平台",
          "先复用商品、订单、支付和运营基础设施。",
          "商品与履约流程无法在平台规则内表达时。",
        ),
        simple: route(
          "简化备选",
          "平台标准主题 + 最少应用",
          "更快验证商品、流量和履约，不先自建交易系统。",
          "需要高度定制的 B2B 报价、合同或多级审批时。",
        ),
        scalable: route(
          "可扩展备选",
          "Headless Commerce + 独立前端 + 事件与订单集成",
          "适合多渠道、复杂体验和专门工程团队。",
          "订单量和体验尚未证明值得承担集成复杂度时。",
        ),
      };
    case "internal":
      return {
        primary: route(
          "首选：内部工具路线",
          "成熟低代码内部工具 + 受控数据源，或 Next.js + PostgreSQL",
          "按权限、审计和业务复杂度在配置速度与代码控制间选择。",
          "工具会接触高敏数据但平台权限、地区和审计能力未核验时。",
        ),
        simple: route(
          "简化备选",
          "只读仪表盘或表单工作流原型",
          "先验证流程和字段，避免一开始重建全部后台。",
          "原型会直接执行不可逆生产操作时。",
        ),
        scalable: route(
          "可扩展备选",
          "模块化 Web App + SSO/RBAC + 审计日志 + PostgreSQL",
          "适合多人角色、复杂审批和长期内部平台。",
          "团队没有身份、安全和运维能力时。",
        ),
      };
  }
}

function baseRoutesEn(answers: ProjectAnswers): {
  primary: RouteOption;
  simple: RouteOption;
  scalable: RouteOption;
} {
  const visual = answers.priority === "visual-editing" || ["operator", "approval"].includes(answers.contentOwner);
  const speed = answers.priority === "speed";
  switch (answers.websiteType) {
    case "corporate":
      return {
        primary: visual
          ? route("Primary: visual content route", "Webflow or WordPress with a controlled theme/plugin set", "Operators can maintain content without depending on a developer for every update.", "Avoid when complex sign-in or transactions are required, or platform migration limits are unacceptable.")
          : route("Primary: content-first code route", "Astro + Git + managed static hosting", "Strong for content and performance with portable code and a small runtime surface.", "Avoid when non-technical operators must redesign pages daily without a CMS."),
        simple: route("Simpler option", speed ? "Framer / Webflow template" : "Plain HTML / Astro static site", "Fewer systems can launch a small, stable site quickly.", "Avoid for complex approvals, memberships, or business data."),
        scalable: route("Scalable option", "Next.js or Nuxt + headless CMS", "Supports multiple languages, editors, and later dynamic features.", "Adds unnecessary build and maintenance work for a few stable pages."),
      };
    case "landing":
      return {
        primary: route("Primary: single-goal route", visual || speed ? "Framer / Webflow" : "Astro / static HTML", "Build, test, and replace content quickly around one call to action.", "Avoid for sign-in, complex orders, or extensive cross-page content."),
        simple: route("Simpler option", "Single HTML page + managed form service", "Few dependencies suit short campaigns and controlled forms.", "Avoid when forms contain sensitive data or require complex CRM logic."),
        scalable: route("Scalable option", "Next.js / Astro + CMS + experimentation and analytics layer", "Supports sustained campaigns, variants, and team workflows.", "Avoid when there is no ongoing experimentation or operations owner."),
      };
    case "portfolio":
      return {
        primary: route("Primary: portfolio-content route", visual ? "Framer / Webflow" : "Astro + content collections", "Structured case studies keep content and presentation consistent.", "Avoid for complex accounts or multi-person approvals."),
        simple: route("Simpler option", "Static single-page portfolio", "Lowest maintenance when work changes infrequently.", "Avoid when cases need filtering, search, multiple languages, or frequent updates."),
        scalable: route("Scalable option", "Astro / Next.js + headless CMS", "Supports a growing case library, multiple editors, and reuse.", "Avoid when no one can maintain the content model."),
      };
    case "blog":
      return {
        primary: visual
          ? route("Primary: editorial-admin route", "WordPress or headless CMS + frontend", "Operators can manage drafts, categories, and publishing.", "Avoid when plugin security or API integrations cannot be maintained.")
          : route("Primary: file-based content route", "Astro + Markdown / MDX", "Content and code share version control and produce simple static output.", "Avoid when non-technical authors require complex approval and visual editing."),
        simple: route("Simpler option", "Managed blog platform or static documentation template", "Validate sustained publishing before building a system.", "Avoid when brand control, data ownership, or custom interaction is mandatory."),
        scalable: route("Scalable option", "Next.js / Nuxt + headless CMS + search", "Supports multiple authors, languages, structured content, and product documentation.", "Avoid for a small article set without content-model ownership."),
      };
    case "app":
      return {
        primary: route("Primary: controlled full-stack route", "Next.js / Nuxt + PostgreSQL (optionally a managed service such as Supabase)", "Covers identity, data, server logic, and ongoing iteration.", "Avoid when no one owns database, authorization, and production operations."),
        simple: route("Simpler option", "Disposable prototype + managed backend", "Validate the critical user task before choosing production architecture.", "Avoid once real sensitive data, payment, or availability commitments are involved."),
        scalable: route("Scalable option", "Modular web frontend + services/API + PostgreSQL + observability", "Fits complex permissions, team boundaries, and high reliability.", "Often over-engineered before users and the business are validated."),
      };
    case "ecommerce":
      return {
        primary: route("Primary: mature commerce platform", "Shopify or a mature managed platform for the target region", "Reuse product, order, payment, and operations infrastructure.", "Avoid when product and fulfillment rules cannot be expressed on the platform."),
        simple: route("Simpler option", "Standard platform theme + minimal apps", "Validate products, traffic, and fulfillment before building transaction systems.", "Avoid for highly customized B2B quoting, contracts, or multi-level approval."),
        scalable: route("Scalable option", "Headless commerce + separate frontend + event and order integrations", "Fits multiple channels, custom experiences, and a dedicated engineering team.", "Avoid until order volume and experience justify integration complexity."),
      };
    case "internal":
      return {
        primary: route("Primary: internal-tool route", "Mature low-code internal tool + controlled data source, or Next.js + PostgreSQL", "Balance configuration speed and code control using permissions, audit, and workflow complexity.", "Avoid when sensitive data is involved but platform permissions, region, or audit capabilities are unverified."),
        simple: route("Simpler option", "Read-only dashboard or form-workflow prototype", "Validate the workflow and fields before rebuilding an entire back office.", "Avoid when the prototype can execute irreversible production actions."),
        scalable: route("Scalable option", "Modular web app + SSO/RBAC + audit log + PostgreSQL", "Fits multiple roles, complex approvals, and a long-lived internal platform.", "Avoid when the team lacks identity, security, and operations capability."),
      };
  }
}

export function recommendationFor(
  answers: ProjectAnswers,
  locale: Locale = "zh",
): RouteRecommendation {
  const riskResult = riskForAnswersInLocale(answers, locale);
  const routes = baseRoutes(answers, locale);
  const constraints: string[] = [];

  if (["mainland", "both"].includes(answers.region)) {
    constraints.push(
      locale === "en"
        ? "Mainland China is an added constraint: verify registration, hosting regions, third-party script/API availability, cross-border data, and privacy requirements separately instead of letting region replace the whole technology decision."
        : "中国大陆是附加约束：分别核验备案、托管节点、第三方脚本/API 可用性、跨境数据与隐私要求；不要用地区选择直接覆盖整套技术方案。",
    );
  }
  if (["global", "both"].includes(answers.region)) {
    constraints.push(
      locale === "en"
        ? "Global access requires validation of CDN behavior, languages, time zones, privacy, and target-market payment and data requirements."
        : "全球访问需验证 CDN、语言、时区、隐私与目标市场的支付/数据要求。",
    );
  }
  if (["operator", "approval"].includes(answers.contentOwner)) {
    constraints.push(
      locale === "en"
        ? "Operators or multiple people maintain content, so the technology decision must cover a CMS, preview, permissions, approval, and content-version rollback."
        : "内容由运营或多人维护：技术决策必须包含 CMS、预览、权限、审批与回滚内容版本的方案。",
    );
  }
  if (answers.priority === "ownership") {
    constraints.push(
      locale === "en"
        ? "Code ownership is the priority: record export capability, data formats, domain control, and vendor-migration paths in the ADR."
        : "代码所有权优先：在 ADR 中记录导出能力、数据格式、域名控制和供应商迁移路径。",
    );
  }
  if (answers.priority === "cost") {
    constraints.push(
      locale === "en"
        ? "Cost is the priority: include maintenance labor, plugins/apps, traffic growth, and migration costs—not only the first month's price."
        : "成本优先：同时记录人力维护、插件/应用、流量增长和迁移成本，不能只看首月价格。",
    );
  }

  const content = workflowFor(locale);
  const currentStage = START_POINTS.find((item) => item.id === answers.startPoint)?.inferredStage ?? 1;
  const today =
    currentStage === 1
      ? locale === "en"
        ? ["Use the project-kickoff prompt to clarify the goal", "List three confirmed facts and three unknowns", "Confirm one primary user and their top task"]
        : ["用“项目启动与需求访谈”提示词澄清目标", "列出 3 项已知事实和 3 项未知项", "确认一个主要用户及其首要任务"]
      : locale === "en"
        ? [
            `Review evidence from earlier stages; having “${labelFor(content.startPoints, answers.startPoint)}” does not make them pass automatically`,
            `Open stage ${currentStage} and add evidence for its first missing gate`,
            "Generate the prompt for the current stage and require AI to ask about every marked unknown",
          ]
        : [
            `复核此前阶段的证据，不能因为“已有${labelFor(START_POINTS, answers.startPoint)}”就自动视为通过`,
            `打开阶段 ${currentStage}，补齐第一个缺失的 Gate 证据`,
            "生成当前阶段提示词，并让 AI 先追问所有标记为未知的内容",
          ];

  return {
    risk: riskResult.risk,
    riskReasons: riskResult.reasons,
    ...routes,
    constraints,
    today,
  };
}

export function gateApplies(
  gate: GateDefinition,
  answers: ProjectAnswers,
  risk: RiskLevel,
): boolean {
  if (gate.appliesTo && !gate.appliesTo.includes(answers.websiteType)) return false;
  if (gate.requiresAnyFeature && !gate.requiresAnyFeature.some((feature) => answers.features.includes(feature))) {
    return false;
  }
  if (gate.regions && !gate.regions.includes(answers.region)) return false;
  if (gate.riskLevels && !gate.riskLevels.includes(risk)) return false;
  return true;
}

export function applicableGates(project: WebsiteProject, stage: StageDefinition): GateDefinition[] {
  return stage.gates.filter((gate) => gateApplies(gate, project.answers, project.recommendation.risk));
}

export function gateIsPassed(progress?: { passed: boolean; evidence: string }): boolean {
  return Boolean(progress?.passed && progress.evidence.trim());
}

export function stageCanBeDone(project: WebsiteProject, stage: StageDefinition): boolean {
  const stageProgress = project.stages[String(stage.id)];
  return applicableGates(project, stage).every((gate) => gateIsPassed(stageProgress?.gates[gate.id]));
}

export function projectProgress(project: WebsiteProject): {
  passed: number;
  total: number;
  percent: number;
} {
  let passed = 0;
  let total = 0;

  for (const stage of STAGES) {
    const stageProgress = project.stages[String(stage.id)];
    if (stageProgress?.status === "not_applicable" && stageProgress.notApplicableReason.trim()) continue;
    for (const gate of applicableGates(project, stage)) {
      total += 1;
      if (gateIsPassed(stageProgress?.gates[gate.id])) passed += 1;
    }
  }

  return { passed, total, percent: total === 0 ? 0 : Math.round((passed / total) * 100) };
}

export function currentStage(
  project: WebsiteProject,
  locale: Locale = "zh",
): StageDefinition {
  for (const stage of STAGES) {
    const progress = project.stages[String(stage.id)];
    if (progress?.status === "not_applicable" && progress.notApplicableReason.trim()) continue;
    if (progress?.status !== "done" || !stageCanBeDone(project, stage)) {
      return workflowFor(locale).stages.find((item) => item.id === stage.id) ?? stage;
    }
  }
  return workflowFor(locale).stages.at(-1) ?? STAGES[STAGES.length - 1];
}

export function nextAction(
  project: WebsiteProject,
  locale: Locale = "zh",
): {
  stage: StageDefinition;
  title: string;
  detail: string;
  gateId?: string;
} {
  const stage = currentStage(project, locale);
  const stageProgress = project.stages[String(stage.id)];

  if (stageProgress?.status === "blocked" && stageProgress.blocker.trim()) {
    return {
      stage,
      title:
        locale === "en"
          ? `Resolve blocker: ${stageProgress.blocker.trim()}`
          : `解除阻塞：${stageProgress.blocker.trim()}`,
      detail:
        locale === "en"
          ? "Identify the owner, missing material, or new authorization first; do not let AI guess and continue."
          : "先明确负责人、缺失资料或需要的新授权；不要让 AI 猜测后继续。",
    };
  }

  const missing = applicableGates(project, stage).find(
    (gate) => !gateIsPassed(stageProgress?.gates[gate.id]),
  );
  if (missing) {
    return { stage, gateId: missing.id, title: missing.title, detail: missing.help };
  }

  if (stageProgress?.status !== "done") {
    return {
      stage,
      title:
        locale === "en"
          ? `Submit “${stage.title}” for acceptance`
          : `把“${stage.title}”提交验收`,
      detail:
        locale === "en"
          ? "Applicable gates have evidence. Ask the accountable owner to review them before marking the stage done."
          : "适用 Gate 已有证据；请由相应负责人复核后再标记完成。",
    };
  }

  return {
    stage,
    title: locale === "en" ? "All applicable gates have passed" : "全部适用 Gate 已通过",
    detail:
      locale === "en"
        ? "Export the project JSON and schedule the first post-launch review."
        : "导出项目 JSON，并安排上线后的第一次复盘。",
  };
}

export function createProject(
  name: string,
  answers: ProjectAnswers,
  id = globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
  locale: Locale = "zh",
): WebsiteProject {
  const timestamp = nowIso();
  const inferredStage = START_POINTS.find((item) => item.id === answers.startPoint)?.inferredStage ?? 1;
  const stages: WebsiteProject["stages"] = {};

  for (const stage of STAGES) {
    const gates: StageProgress["gates"] = {};
    for (const gate of stage.gates) gates[gate.id] = { passed: false, evidence: "" };
    stages[String(stage.id)] = {
      status: stage.id < inferredStage ? "review" : stage.id === inferredStage ? "in_progress" : "not_started",
      notApplicableReason: "",
      blocker: "",
      gates,
    };
  }

  return {
    schemaVersion: 2,
    id,
    name: name.trim() || (locale === "en" ? "Untitled website plan" : "未命名网站计划"),
    createdAt: timestamp,
    updatedAt: timestamp,
    answers,
    recommendation: recommendationFor(answers, locale),
    stages,
    promptDrafts: {},
  };
}

export function projectSummary(
  project: WebsiteProject,
  locale: Locale = "zh",
): string {
  const content = workflowFor(locale);
  const type = labelFor(content.websiteTypes, project.answers.websiteType);
  const region = labelFor(content.regions, project.answers.region);
  const owner = labelFor(content.contentOwners, project.answers.contentOwner);
  const priority = labelFor(content.priorities, project.answers.priority);
  const features = project.answers.features.length
    ? project.answers.features
        .map((item) => labelFor(content.features, item))
        .join(locale === "en" ? ", " : "、")
    : locale === "en"
      ? "no sign-in, permissions, personal data, uploads, or payments"
      : "无登录、权限、个人信息、上传或支付";
  return locale === "en"
    ? `${type}; primary region: ${region}; content owner: ${owner}; priority: ${priority}; declared features: ${features}.`
    : `${type}；主要访问地域：${region}；内容维护：${owner}；优先级：${priority}；声明功能：${features}。`;
}

export function promptDefaults(
  project: WebsiteProject,
  template: PromptTemplate,
  locale: Locale = "zh",
): Record<string, string> {
  const content = workflowFor(locale);
  const values: Record<string, string> = {};
  for (const field of template.fields) values[field.id] = "";
  if ("projectName" in values) values.projectName = project.name;
  if ("regionConstraints" in values) {
    values.regionConstraints = labelFor(content.regions, project.answers.region);
  }
  if ("teamConstraints" in values) {
    values.teamConstraints =
      locale === "en"
        ? `Content owner: ${labelFor(content.contentOwners, project.answers.contentOwner)}; priority: ${labelFor(content.priorities, project.answers.priority)}.`
        : `内容维护者：${labelFor(CONTENT_OWNERS, project.answers.contentOwner)}；优先级：${labelFor(PRIORITIES, project.answers.priority)}。`;
  }
  if ("requirements" in values) values.requirements = projectSummary(project, locale);
  return values;
}

export function missingPromptFields(
  template: PromptTemplate,
  values: Record<string, string>,
  unknowns: string[],
): string[] {
  return template.fields
    .filter((field) => field.required && !values[field.id]?.trim() && !unknowns.includes(field.id))
    .map((field) => field.label);
}

export function composePrompt(
  project: WebsiteProject,
  template: PromptTemplate,
  values: Record<string, string>,
  unknowns: string[],
  locale: Locale = "zh",
): string {
  const stages = workflowFor(locale).stages;
  const localizedRecommendation = recommendationFor(project.answers, locale);
  const fieldLines = template.fields.map((field) => {
    const value = values[field.id]?.trim();
    if (unknowns.includes(field.id)) {
      return locale === "en"
        ? `- ${field.label}: unknown; ask first and do not guess.`
        : `- ${field.label}：未知；请先追问，不得猜测。`;
    }
    return locale === "en"
      ? `- ${field.label}: ${value || "not provided"}`
      : `- ${field.label}：${value || "未提供"}`;
  });
  const unknownLabels = template.fields
    .filter((field) => unknowns.includes(field.id))
    .map((field) => field.label);
  const stageLabels = template.stageIds
    .map((stageId) => stages.find((stage) => stage.id === stageId)?.title)
    .filter(Boolean)
    .join(" / ");

  if (locale === "en") {
    return [
      "# Task",
      template.title,
      "",
      "## Project context",
      `- Project: ${project.name}`,
      `- Roadmap summary: ${projectSummary(project, locale)}`,
      ...fieldLines,
      "",
      "## Current stage",
      stageLabels,
      "",
      "## Known material and sources",
      "Use only material I provide and sources you can open and verify directly. Record URL, date, and scope; separate confirmed facts, reasonable inferences, and engineering judgments.",
      "",
      "## Scope",
      template.when,
      "",
      "## Out of scope",
      "Do not expand into unauthorized pages, systems, accounts, production data, or external writes. Do not invent missing business information for completeness.",
      "",
      "## Technical and business constraints",
      ...localizedRecommendation.constraints.map((item) => `- ${item}`),
      "- API keys, passwords, tokens, real customer personal data, and unauthorized internal material must not enter code, prompts, logs, or public artifacts.",
      "",
      "## Expected execution steps",
      ...template.executionSteps.map((item, index) => `${index + 1}. ${item}`),
      "",
      "## Deliverables",
      ...template.deliverables.map((item) => `- ${item}`),
      "",
      "## Acceptance criteria",
      ...template.acceptance.map((item) => `- ${item}`),
      "",
      "## Stop conditions",
      ...template.stopConditions.map((item) => `- ${item}`),
      "",
      "## Unknowns: do not guess",
      unknownLabels.length
        ? `The following information is unknown: ${unknownLabels.join(", ")}. Ask about each item before work begins; if nobody can confirm it, mark the task blocked.`
        : "If an unknown could change scope, architecture, security, or release behavior, stop and ask immediately instead of assuming.",
    ].join("\n");
  }

  return [
    "# 任务",
    template.title,
    "",
    "## 项目背景",
    `- 项目：${project.name}`,
    `- 路线摘要：${projectSummary(project)}`,
    ...fieldLines,
    "",
    "## 当前阶段",
    stageLabels,
    "",
    "## 已知资料与来源",
    "只使用我提供的资料和你能直接打开核验的来源。对来源记录链接、日期、适用范围；把事实、合理推测和工程判断分开。",
    "",
    "## 范围",
    template.when,
    "",
    "## 非范围",
    "不得扩大到未授权的页面、系统、账号、生产数据或外部写操作；不得为了完整而编造缺失业务信息。",
    "",
    "## 技术与业务约束",
    ...localizedRecommendation.constraints.map((item) => `- ${item}`),
    "- API Key、密码、Token、真实客户个人信息不得写入代码、提示词、日志或公开产物。",
    "",
    "## 期望执行步骤",
    ...template.executionSteps.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## 交付物",
    ...template.deliverables.map((item) => `- ${item}`),
    "",
    "## 验收标准",
    ...template.acceptance.map((item) => `- ${item}`),
    "",
    "## 停止条件",
    ...template.stopConditions.map((item) => `- ${item}`),
    "",
    "## 未知项：不得猜测",
    unknownLabels.length
      ? `以下内容未知：${unknownLabels.join("、")}。开始执行前逐项追问；如无人能确认，标记为阻塞。`
      : "如执行中发现会改变范围、架构、安全或发布方式的未知项，立即停止并追问，不得自行假设。",
  ].join("\n");
}

export function savedPromptDraft(
  values: Record<string, string>,
  unknowns: string[],
): PromptDraft {
  return { values, unknowns, updatedAt: nowIso() };
}

export function validateImportedProject(
  value: unknown,
  locale: Locale = "zh",
): WebsiteProject {
  if (!value || typeof value !== "object") {
    throw new Error(locale === "en" ? "The file is not a project object." : "文件不是项目对象。");
  }
  const candidate = value as Partial<WebsiteProject>;
  if (candidate.schemaVersion !== 2) {
    throw new Error(
      locale === "en"
        ? "Unsupported project version; schemaVersion 2 is required."
        : "项目版本不受支持，需要 schemaVersion 2。",
    );
  }
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
    throw new Error(locale === "en" ? "The project is missing an id or name." : "项目缺少 id 或名称。");
  }
  if (!candidate.answers || !WEBSITE_TYPES.some((item) => item.id === candidate.answers?.websiteType)) {
    throw new Error(locale === "en" ? "The project website type is invalid." : "项目的网站类型无效。");
  }
  if (!candidate.stages || typeof candidate.stages !== "object") {
    throw new Error(locale === "en" ? "The project has no stage data." : "项目缺少阶段数据。");
  }
  if (!candidate.recommendation) candidate.recommendation = recommendationFor(candidate.answers, locale);
  if (!candidate.promptDrafts) candidate.promptDrafts = {};
  return candidate as WebsiteProject;
}

export function safeFileName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return cleaned || "ai-website-plan";
}

export function promptForStage(
  stageId: number,
  locale: Locale = "zh",
): PromptTemplate {
  const content = workflowFor(locale);
  const stage = content.stages.find((item) => item.id === stageId) ?? content.stages[0];
  return (
    content.promptTemplates.find((template) => stage.promptIds.includes(template.id)) ??
    content.promptTemplates[0]
  );
}
