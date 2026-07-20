"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import appIcon from "./assets/app-icon.png";
import { GLOSSARY, TECHNOLOGIES } from "./lib/knowledge";
import {
  applicableGates,
  composePrompt,
  createProject,
  currentStage,
  gateIsPassed,
  missingPromptFields,
  nextAction,
  projectProgress,
  projectSummary,
  promptDefaults,
  promptForStage,
  safeFileName,
  savedPromptDraft,
  stageCanBeDone,
  validateImportedProject,
} from "./lib/logic";
import { REVIEWED_SKILL_CATALOG, weightedSkillScore } from "./lib/skills";
import type {
  GlossaryRecord,
  LocalInventory,
  ProjectAnswers,
  ReviewedSkillCatalog,
  SkillRecord,
  StageStatus,
  WebsiteProject,
} from "./lib/types";
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
} from "./lib/workflow-content";

type ViewId = "home" | "route" | "prompts" | "technologies" | "glossary" | "skills" | "about";

const PROJECTS_KEY = "ai-website-sop-projects-v2";
const ACTIVE_PROJECT_KEY = "ai-website-sop-active-project-v2";
const CATALOG_CACHE_KEY = "ai-website-sop-reviewed-catalog-v1";

const emptyAnswers: ProjectAnswers = {
  websiteType: "corporate",
  startPoint: "idea",
  features: [],
  contentOwner: "self-ai",
  region: "global",
  priority: "ownership",
};

const stageTermMap: Record<number, string[]> = {
  1: ["spec", "mvp"],
  2: ["seo", "geo"],
  3: ["spec", "prd", "sitemap"],
  4: ["adr", "prototype", "design-system"],
  5: ["ci-cd", "lint", "type-check", "secret"],
  6: ["vertical-slice", "unit-test", "integration-test"],
  7: ["e2e", "uat", "accessibility", "core-web-vitals"],
  8: ["rollback", "monitoring", "observability", "rpo-rto"],
};

function cloneProject(project: WebsiteProject): WebsiteProject {
  return JSON.parse(JSON.stringify(project)) as WebsiteProject;
}

function downloadText(fileName: string, text: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function OptionCard({
  selected,
  title,
  description,
  onClick,
  testId,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className={`option-card ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: StageStatus }) {
  return <span className={`status-badge status-${status}`}>{STAGE_STATUS_LABELS[status]}</span>;
}

function EmptyProject({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  return (
    <section className="empty-state" aria-labelledby="empty-title">
      <p className="eyebrow">尚未创建项目</p>
      <h2 id="empty-title">先回答 6 个问题，系统才能给你适用的路线</h2>
      <p>不会自动上传资料，也不会把浏览器中的项目写进公共网站。</p>
      <div className="button-row">
        <button type="button" className="button primary" onClick={onCreate}>创建新网站计划</button>
        <button type="button" className="button secondary" onClick={onImport}>导入项目 JSON</button>
      </div>
    </section>
  );
}

export default function SiteApp() {
  const [view, setView] = useState<ViewId>("home");
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [draftAnswers, setDraftAnswers] = useState<ProjectAnswers>(emptyAnswers);
  const [toast, setToast] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [termDialog, setTermDialog] = useState<GlossaryRecord | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState(PROMPT_TEMPLATES[0].id);
  const [techQuery, setTechQuery] = useState("");
  const [techCategory, setTechCategory] = useState("全部");
  const [termQuery, setTermQuery] = useState("");
  const [termLevel, setTermLevel] = useState<"all" | "core" | "advanced">("core");
  const [skillQuery, setSkillQuery] = useState("");
  const [skillTier, setSkillTier] = useState<"core" | "conditional" | "study">("core");
  const [catalog, setCatalog] = useState<ReviewedSkillCatalog>(REVIEWED_SKILL_CATALOG);
  const [catalogMessage, setCatalogMessage] = useState("使用随页面发布的已审核目录");
  const [localInventory, setLocalInventory] = useState<LocalInventory | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const importInputRef = useRef<HTMLInputElement>(null);
  const inventoryInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]") as unknown[];
      const loaded = stored.map(validateImportedProject);
      const storedActive = localStorage.getItem(ACTIVE_PROJECT_KEY) || "";
      // Browser storage is an external system; hydrate once after the client mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjects(loaded);
      setActiveProjectId(loaded.some((project) => project.id === storedActive) ? storedActive : loaded[0]?.id ?? "");

      const cachedCatalog = localStorage.getItem(CATALOG_CACHE_KEY);
      if (cachedCatalog) {
        const parsed = JSON.parse(cachedCatalog) as ReviewedSkillCatalog;
        if (parsed.schemaVersion === 1 && parsed.reviewStatus === "reviewed" && Array.isArray(parsed.skills)) {
          setCatalog(parsed);
          setCatalogMessage(`使用本机缓存的已审核目录 ${parsed.catalogVersion}`);
        }
      }
    } catch {
      setToast("本机保存的数据无法读取；公共内容仍可正常使用。");
    } finally {
      setHydrated(true);
    }

    setIsOnline(location.protocol !== "file:" && navigator.onLine);
    const online = () => setIsOnline(location.protocol !== "file:");
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    if ((location.protocol === "https:" || location.hostname === "localhost") && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    } catch {
      queueMicrotask(() => setToast("浏览器阻止了本地保存；请导出项目 JSON，避免刷新后丢失内容。"));
    }
  }, [projects, activeProjectId, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (globalSearchOpen) searchInputRef.current?.focus();
  }, [globalSearchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (event.key === "Escape") {
        setGlobalSearchOpen(false);
        setTermDialog(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateActiveProject = (mutator: (project: WebsiteProject) => void) => {
    if (!activeProjectId) return;
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeProjectId) return project;
        const next = cloneProject(project);
        mutator(next);
        next.updatedAt = new Date().toISOString();
        return next;
      }),
    );
  };

  const startWizard = () => {
    setWizardStep(1);
    setProjectName("");
    setDraftAnswers(emptyAnswers);
    setWizardOpen(true);
  };

  const finishWizard = () => {
    const project = createProject(projectName, draftAnswers);
    setProjects((current) => [...current, project]);
    setActiveProjectId(project.id);
    setWizardOpen(false);
    setView("route");
    setSelectedPromptId(promptForStage(currentStage(project).id).id);
    setToast("网站计划已创建。下一步只需处理系统标出的一个 Gate。");
  };

  const importProjectFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const project = validateImportedProject(JSON.parse(text));
      const imported = { ...project, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
      setProjects((current) => [...current.filter((item) => item.id !== imported.id), imported]);
      setActiveProjectId(imported.id);
      setView("route");
      setToast("项目已导入；此前阶段仍需按证据复核。");
    } catch (error) {
      setToast(error instanceof Error ? `导入失败：${error.message}` : "导入失败：文件格式无效。");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const exportActiveProject = () => {
    if (!activeProject) return;
    downloadText(
      `${safeFileName(activeProject.name)}-project.json`,
      JSON.stringify(activeProject, null, 2),
      "application/json;charset=utf-8",
    );
    setToast("项目 JSON 已导出；文件只包含你当前浏览器中的这个项目。");
  };

  const deleteActiveProject = () => {
    if (!activeProject) return;
    if (!window.confirm(`确定从此浏览器删除“${activeProject.name}”吗？请先导出备份。`)) return;
    const remaining = projects.filter((project) => project.id !== activeProject.id);
    setProjects(remaining);
    setActiveProjectId(remaining[0]?.id ?? "");
    setView(remaining.length ? "route" : "home");
    setToast("项目已从此浏览器删除；未导出的内容无法在页面中恢复。");
  };

  const openPromptForCurrentStage = () => {
    if (!activeProject) return;
    setSelectedPromptId(promptForStage(currentStage(activeProject).id).id);
    setView("prompts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const globalResults = useMemo(() => {
    const query = normalize(globalQuery);
    if (!query) return [];
    const tokens = query.split(" ").filter(Boolean);
    const records = [
      ...GLOSSARY.map((item) => ({
        type: "术语" as const,
        title: item.term,
        description: item.definition,
        keywords: [item.category, ...(item.aliases ?? [])].join(" "),
        action: () => setTermDialog(item),
      })),
      ...TECHNOLOGIES.map((item) => ({
        type: "技术" as const,
        title: item.name,
        description: item.what,
        keywords: `${item.category} ${item.chooseWhen} ${item.avoidWhen}`,
        action: () => {
          setTechQuery(item.name);
          setView("technologies");
        },
      })),
      ...catalog.skills.map((item) => ({
        type: "Skill" as const,
        title: item.name,
        description: item.purpose,
        keywords: `${item.repo} ${item.path} ${item.installType}`,
        action: () => {
          setSkillQuery(item.name);
          setSkillTier(item.tier);
          setView("skills");
        },
      })),
      ...PROMPT_TEMPLATES.map((item) => ({
        type: "提示词" as const,
        title: item.title,
        description: item.when,
        keywords: `${item.deliverables.join(" ")} ${item.stageIds.join(" ")}`,
        action: () => {
          setSelectedPromptId(item.id);
          setView("prompts");
        },
      })),
    ];
    return records
      .map((item) => {
        const haystack = normalize(`${item.title} ${item.description} ${item.keywords}`);
        const matches = tokens.every((token) => haystack.includes(token));
        const score = normalize(item.title).includes(query) ? 2 : 1;
        return { item, matches, score };
      })
      .filter((entry) => entry.matches)
      .sort((a, b) => b.score - a.score)
      .slice(0, 18)
      .map((entry) => entry.item);
  }, [globalQuery, catalog.skills]);

  const handleGlobalResult = (action: () => void) => {
    action();
    setGlobalSearchOpen(false);
    setGlobalQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateStageStatus = (stageId: number, status: StageStatus) => {
    if (!activeProject) return;
    const stage = STAGES.find((item) => item.id === stageId);
    if (!stage) return;
    if (status === "done" && !stageCanBeDone(activeProject, stage)) {
      setToast("还不能标记完成：先为所有适用 Gate 填写证据并通过验收。");
      status = "review";
    }
    updateActiveProject((project) => {
      project.stages[String(stageId)].status = status;
      if (status !== "blocked") project.stages[String(stageId)].blocker = "";
    });
  };

  const updateGateEvidence = (stageId: number, gateId: string, evidence: string) => {
    updateActiveProject((project) => {
      const gate = project.stages[String(stageId)].gates[gateId];
      gate.evidence = evidence;
      if (!evidence.trim()) gate.passed = false;
      gate.updatedAt = new Date().toISOString();
      if (project.stages[String(stageId)].status === "not_started") {
        project.stages[String(stageId)].status = "in_progress";
      }
    });
  };

  const toggleGate = (stageId: number, gateId: string, passed: boolean) => {
    if (!activeProject) return;
    const progress = activeProject.stages[String(stageId)].gates[gateId];
    if (passed && !progress.evidence.trim()) {
      setToast("先填写证据链接或验收记录，再标记 Gate 通过。");
      return;
    }
    updateActiveProject((project) => {
      project.stages[String(stageId)].gates[gateId].passed = passed;
      project.stages[String(stageId)].gates[gateId].updatedAt = new Date().toISOString();
      const stage = STAGES.find((item) => item.id === stageId);
      project.stages[String(stageId)].status = passed && stage && stageCanBeDone(project, stage)
        ? "review"
        : "in_progress";
    });
  };

  const selectedPrompt = PROMPT_TEMPLATES.find((item) => item.id === selectedPromptId) ?? PROMPT_TEMPLATES[0];
  const selectedDraft = activeProject?.promptDrafts[selectedPrompt.id];
  const promptValues = activeProject
    ? selectedDraft?.values ?? promptDefaults(activeProject, selectedPrompt)
    : {};
  const promptUnknowns = selectedDraft?.unknowns ?? [];
  const promptText = activeProject
    ? composePrompt(activeProject, selectedPrompt, promptValues, promptUnknowns)
    : "";
  const missingFields = missingPromptFields(selectedPrompt, promptValues, promptUnknowns);
  const hasResidualPlaceholders = /\{\{[^}]+\}\}|<<[^>]+>>/.test(promptText);

  const updatePromptDraft = (values: Record<string, string>, unknowns: string[]) => {
    updateActiveProject((project) => {
      project.promptDrafts[selectedPrompt.id] = savedPromptDraft(values, unknowns);
    });
  };

  const changePromptField = (fieldId: string, value: string) => {
    updatePromptDraft({ ...promptValues, [fieldId]: value }, promptUnknowns);
  };

  const togglePromptUnknown = (fieldId: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...promptUnknowns, fieldId]))
      : promptUnknowns.filter((item) => item !== fieldId);
    updatePromptDraft(promptValues, next);
  };

  const checkCatalogUpdates = async () => {
    if (!isOnline || location.protocol === "file:") {
      setCatalogMessage("当前离线；继续使用最近一次已审核目录");
      return;
    }
    setCatalogMessage("正在检查已审核目录…");
    try {
      const response = await fetch(`catalog/skills-reviewed.json?check=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = (await response.json()) as ReviewedSkillCatalog;
      if (next.schemaVersion !== 1 || next.reviewStatus !== "reviewed" || !Array.isArray(next.skills)) {
        throw new Error("目录没有通过客户端结构校验");
      }
      setCatalog(next);
      localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(next));
      setCatalogMessage(
        next.catalogVersion === catalog.catalogVersion
          ? `已是最新审核版本 ${next.catalogVersion}`
          : `已载入审核版本 ${next.catalogVersion}；原版本 ${catalog.catalogVersion}`,
      );
    } catch {
      setCatalogMessage("检查失败；继续使用最近一次已审核目录");
    }
  };

  const importInventory = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as LocalInventory;
      if (parsed.schemaVersion !== 1 || parsed.source !== "local-readonly-scan" || !Array.isArray(parsed.skills)) {
        throw new Error("不是受支持的只读扫描清单");
      }
      setLocalInventory(parsed);
      setToast("已导入本机发现清单。它不代表当前会话一定可调用这些 Skills。");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "本机清单无法读取。");
    } finally {
      if (inventoryInputRef.current) inventoryInputRef.current.value = "";
    }
  };

  const discoveredLocally = (skill: SkillRecord) =>
    localInventory?.skills.some((item) => {
      const haystack = normalize(`${item.name} ${item.path ?? ""}`);
      return haystack.includes(normalize(skill.name.replace(/（.*?）/g, ""))) || haystack.includes(normalize(skill.path));
    }) ?? false;

  const techCategories = ["全部", ...Array.from(new Set(TECHNOLOGIES.map((item) => item.category)))];
  const filteredTechnologies = TECHNOLOGIES.filter((item) => {
    const categoryMatch = techCategory === "全部" || item.category === techCategory;
    const query = normalize(techQuery);
    const queryMatch =
      !query || normalize(`${item.name} ${item.what} ${item.chooseWhen} ${item.avoidWhen}`).includes(query);
    return categoryMatch && queryMatch;
  });
  const filteredGlossary = GLOSSARY.filter((item) => {
    const levelMatch = termLevel === "all" || item.level === termLevel;
    const query = normalize(termQuery);
    const queryMatch =
      !query || normalize(`${item.term} ${(item.aliases ?? []).join(" ")} ${item.definition} ${item.category}`).includes(query);
    return levelMatch && queryMatch;
  });
  const filteredSkills = catalog.skills
    .filter((item) => item.tier === skillTier)
    .filter((item) => {
      const query = normalize(skillQuery);
      return !query || normalize(`${item.name} ${item.repo} ${item.path} ${item.purpose}`).includes(query);
    })
    .sort((a, b) => weightedSkillScore(b) - weightedSkillScore(a));

  const navItems: Array<{ id: ViewId; label: string }> = [
    { id: "home", label: "开始" },
    { id: "route", label: "我的路线" },
    { id: "prompts", label: "提示词" },
    { id: "technologies", label: "技术" },
    { id: "glossary", label: "术语" },
    { id: "skills", label: "Skills" },
    { id: "about", label: "说明" },
  ];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="site-header">
        <div className="header-top">
          <button type="button" className="brand" onClick={() => setView("home")} aria-label="返回开始页">
            {/* The single-file offline build inlines this generated asset as a data URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-mark" src={appIcon} alt="" aria-hidden="true" />
            <span><strong>建站向导</strong><small>规划、开发、测试到部署</small></span>
          </button>
          <div className="header-actions">
            {projects.length > 0 && (
              <label className="project-switcher">
                <span className="sr-only">切换项目</span>
                <select value={activeProjectId} onChange={(event) => setActiveProjectId(event.target.value)}>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="search-button" onClick={() => setGlobalSearchOpen(true)}>
              搜索术语、技术、Skills <kbd>⌘ K</kbd>
            </button>
            <span className={`network-state ${isOnline ? "online" : "offline"}`}>{isOnline ? "在线" : "离线"}</span>
          </div>
        </div>
        <nav className="primary-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "is-active" : ""}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main-content" className="main-content">
        {view === "home" && (
          <section className="home-view" aria-labelledby="home-title">
            <div className="hero-panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-asset" src={appIcon} alt="" aria-hidden="true" />
              <p className="eyebrow">本地优先的 AI 建站路线生成器</p>
              <h1 id="home-title">回答 6 个问题，生成从网站规划到部署上线的完整路线</h1>
              <p className="hero-copy">面向零基础用户，把需求、技术选型、开发、测试和上线拆成可执行的 8 阶段证据 Gate。</p>
            </div>
            <div className="entry-grid" aria-label="开始方式">
              <button type="button" className="entry-card primary-entry" onClick={startWizard} data-testid="create-project">
                <span className="entry-number">01</span>
                <strong>创建新网站计划</strong>
                <span>从六问向导开始，获得路线、风险和今天的三件事。</span>
                <b>推荐从这里开始</b>
              </button>
              <button
                type="button"
                className="entry-card"
                onClick={() => (projects.length ? setView("route") : importInputRef.current?.click())}
              >
                <span className="entry-number">02</span>
                <strong>继续 / 导入已有项目</strong>
                <span>{projects.length ? `此浏览器有 ${projects.length} 个项目；也可导入 JSON。` : "从另一台电脑导入项目 JSON。"}</span>
                <b>数据只保存在本机</b>
              </button>
              <button type="button" className="entry-card" onClick={() => setView("glossary")}>
                <span className="entry-number">03</span>
                <strong>查技术、术语和 Skills</strong>
                <span>按来源和核对日期浏览，不把热度当成适用性。</span>
                <b>知识库</b>
              </button>
            </div>
            <div className="privacy-note">
              <strong>本地优先：</strong>项目内容不会自动上传。换电脑时请先导出 JSON，再在新设备导入。
            </div>
          </section>
        )}

        {view === "route" && (
          activeProject ? (
            <RouteView
              project={activeProject}
              onCreate={startWizard}
              onExport={exportActiveProject}
              onImport={() => importInputRef.current?.click()}
              onDelete={deleteActiveProject}
              onOpenPrompt={openPromptForCurrentStage}
              onStatusChange={updateStageStatus}
              onEvidenceChange={updateGateEvidence}
              onGateToggle={toggleGate}
              onUpdateStageText={(stageId, field, value) =>
                updateActiveProject((project) => {
                  project.stages[String(stageId)][field] = value;
                })
              }
              onOpenTerm={(termId) => setTermDialog(GLOSSARY.find((item) => item.id === termId) ?? null)}
            />
          ) : <EmptyProject onCreate={startWizard} onImport={() => importInputRef.current?.click()} />
        )}

        {view === "prompts" && (
          activeProject ? (
            <section className="content-view" aria-labelledby="prompts-title">
              <div className="view-heading">
                <div>
                  <p className="eyebrow">网站类型 × 当前阶段</p>
                  <h1 id="prompts-title">提示词生成器</h1>
                  <p>{projectSummary(activeProject)}</p>
                </div>
                <span className="source-chip">项目：{activeProject.name}</span>
              </div>
              <div className="prompt-layout">
                <aside className="prompt-list" aria-label="提示词类型">
                  {PROMPT_TEMPLATES.map((template, index) => (
                    <button
                      key={template.id}
                      type="button"
                      className={selectedPrompt.id === template.id ? "is-active" : ""}
                      onClick={() => setSelectedPromptId(template.id)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{template.title}</strong>
                    </button>
                  ))}
                </aside>
                <div className="prompt-workspace">
                  <div className="prompt-intro">
                    <div>
                      <h2>{selectedPrompt.title}</h2>
                      <p><strong>什么时候使用：</strong>{selectedPrompt.when}</p>
                    </div>
                    <div className="stage-tags">
                      {selectedPrompt.stageIds.map((id) => <span key={id}>阶段 {id}</span>)}
                    </div>
                  </div>
                  <div className="warning-box">
                    不要填写 API Key、密码、Token、真实客户个人信息或未获授权的内部资料。标记“我不知道”后，生成内容会要求 AI 先追问。
                  </div>
                  <div className="prompt-fields">
                    {selectedPrompt.fields.map((field) => {
                      const isUnknown = promptUnknowns.includes(field.id);
                      return (
                        <div className="field-card" key={field.id}>
                          <div className="field-heading">
                            <label htmlFor={`prompt-${field.id}`}>
                              {field.label} {field.required && <span className="required">必填</span>}
                            </label>
                            <label className="unknown-toggle">
                              <input
                                type="checkbox"
                                checked={isUnknown}
                                onChange={(event) => togglePromptUnknown(field.id, event.target.checked)}
                              />
                              我不知道
                            </label>
                          </div>
                          <p>{field.description}</p>
                          {field.multiline ? (
                            <textarea
                              id={`prompt-${field.id}`}
                              value={promptValues[field.id] ?? ""}
                              disabled={isUnknown}
                              rows={4}
                              placeholder={`示例：${field.example}`}
                              onChange={(event) => changePromptField(field.id, event.target.value)}
                            />
                          ) : (
                            <input
                              id={`prompt-${field.id}`}
                              value={promptValues[field.id] ?? ""}
                              disabled={isUnknown}
                              placeholder={`示例：${field.example}`}
                              onChange={(event) => changePromptField(field.id, event.target.value)}
                            />
                          )}
                          {field.sensitiveWarning && <small>填写前先脱敏；这里只保存到当前浏览器项目。</small>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="prompt-preview-panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">生成预览</p>
                        <h3>复制内容与下方预览完全一致</h3>
                      </div>
                      <div className="button-row compact">
                        <button
                          type="button"
                          className="button secondary"
                          disabled={missingFields.length > 0 || hasResidualPlaceholders}
                          onClick={async () => {
                            await copyText(promptText);
                            setToast("Markdown 提示词已复制。");
                          }}
                        >复制 Markdown</button>
                        <button
                          type="button"
                          className="button secondary"
                          disabled={missingFields.length > 0 || hasResidualPlaceholders}
                          onClick={() => downloadText(`${safeFileName(activeProject.name)}-${selectedPrompt.id}.md`, promptText)}
                        >下载 .md</button>
                      </div>
                    </div>
                    {missingFields.length > 0 && (
                      <div className="validation-error" role="alert">
                        还不能复制：请填写或标记“我不知道”——{missingFields.join("、")}。
                      </div>
                    )}
                    {hasResidualPlaceholders && <div className="validation-error">检测到残留占位符，已禁止复制。</div>}
                    <pre tabIndex={0}>{promptText}</pre>
                  </div>
                  <details className="acceptance-details">
                    <summary>使用前准备、交付物与停止条件</summary>
                    <div className="detail-columns">
                      <div><h4>准备</h4><ul>{selectedPrompt.preparation.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>交付物</h4><ul>{selectedPrompt.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>停止条件</h4><ul>{selectedPrompt.stopConditions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    </div>
                  </details>
                </div>
              </div>
            </section>
          ) : <EmptyProject onCreate={startWizard} onImport={() => importInputRef.current?.click()} />
        )}

        {view === "technologies" && (
          <section className="content-view" aria-labelledby="technologies-title">
            <div className="view-heading">
              <div>
                <p className="eyebrow">选型不是排行榜</p>
                <h1 id="technologies-title">技术方案清单</h1>
                <p>“它是什么”基于直接来源；优缺点和选择建议是工程判断，必须结合你的项目。</p>
              </div>
            </div>
            <div className="filter-bar">
              <label className="search-field"><span className="sr-only">搜索技术</span><input value={techQuery} onChange={(event) => setTechQuery(event.target.value)} placeholder="搜索技术、适用场景或限制" /></label>
              <div className="chip-row" aria-label="技术分类">
                {techCategories.map((category) => (
                  <button key={category} type="button" className={techCategory === category ? "is-active" : ""} onClick={() => setTechCategory(category)}>{category}</button>
                ))}
              </div>
            </div>
            <div className="catalog-grid">
              {filteredTechnologies.map((item) => (
                <article className="knowledge-card" key={item.id}>
                  <div className="card-kicker"><span>{item.category}</span><span>{item.level === "core" ? "新手核心" : "进阶"}</span></div>
                  <h2>{item.name}</h2>
                  <section><h3>它是什么 <small>事实</small></h3><p>{item.what}</p></section>
                  <section className="pros-cons">
                    <div><h3>优点 <small>工程判断</small></h3><ul>{item.pros.map((value) => <li key={value}>{value}</li>)}</ul></div>
                    <div><h3>缺点 <small>工程判断</small></h3><ul>{item.cons.map((value) => <li key={value}>{value}</li>)}</ul></div>
                  </section>
                  <section><h3>什么时候选</h3><p>{item.chooseWhen}</p></section>
                  <section><h3>什么时候避免</h3><p>{item.avoidWhen}</p></section>
                  <footer>
                    <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.label}</a>
                    <span>核对 {item.reviewedAt}</span>
                    <span>{item.volatility === "changing" ? "易变化" : "相对稳定"}</span>
                  </footer>
                </article>
              ))}
            </div>
            {filteredTechnologies.length === 0 && <p className="no-results">没有匹配项。试试框架、托管、测试或 CMS。</p>}
          </section>
        )}

        {view === "glossary" && (
          <section className="content-view" aria-labelledby="glossary-title">
            <div className="view-heading">
              <div>
                <p className="eyebrow">可点击术语库</p>
                <h1 id="glossary-title">先理解核心词，再按需进阶</h1>
                <p>非正式词会明确标注；同一缩写存在多义时，不把本文定义冒充唯一标准。</p>
              </div>
            </div>
            <div className="filter-bar">
              <label className="search-field"><span className="sr-only">搜索术语</span><input value={termQuery} onChange={(event) => setTermQuery(event.target.value)} placeholder="输入 Spec、部署、权限、测试…" /></label>
              <div className="segmented" aria-label="术语难度">
                <button type="button" className={termLevel === "core" ? "is-active" : ""} onClick={() => setTermLevel("core")}>新手核心</button>
                <button type="button" className={termLevel === "advanced" ? "is-active" : ""} onClick={() => setTermLevel("advanced")}>进阶</button>
                <button type="button" className={termLevel === "all" ? "is-active" : ""} onClick={() => setTermLevel("all")}>全部</button>
              </div>
            </div>
            <div className="term-list">
              {filteredGlossary.map((item) => (
                <button type="button" className="term-row" key={item.id} onClick={() => setTermDialog(item)}>
                  <span><strong>{item.term}</strong><small>{item.category}</small></span>
                  <span>{item.definition}</span>
                  <b>{item.claimType === "informal" ? "非正式词" : item.claimType === "engineering-judgment" ? "含工程判断" : "事实定义"}</b>
                </button>
              ))}
            </div>
            {filteredGlossary.length === 0 && <p className="no-results">没有匹配术语。可用顶部全局搜索同时查技术和 Skills。</p>}
          </section>
        )}

        {view === "skills" && (
          <section className="content-view" aria-labelledby="skills-title">
            <div className="view-heading">
              <div>
                <p className="eyebrow">仅收录公开 GitHub 源码</p>
                <h1 id="skills-title">网站与编码 Skills 目录</h1>
                <p>GitHub 有源码、本机发现、当前会话可用是三件不同的事。本页永远不把前两者冒充第三者。</p>
              </div>
              <div className="catalog-version">
                <strong>审核目录 {catalog.catalogVersion}</strong>
                <span>核对 {catalog.reviewedAt}</span>
              </div>
            </div>
            <div className="update-panel">
              <div><strong>目录更新</strong><span>{catalogMessage}</span></div>
              <button type="button" className="button secondary" onClick={checkCatalogUpdates}>检查已审核更新</button>
            </div>
            <div className="inventory-panel">
              <div>
                <strong>可选：导入本机只读扫描清单</strong>
                <span>{localInventory ? `已导入 ${localInventory.skills.length} 项，生成于 ${formatDate(localInventory.generatedAt)}` : "不扫描浏览器；请在本机运行公开脚本后导入 inventory.json。"}</span>
              </div>
              <div className="button-row compact">
                <a className="button secondary" href="tools/scan-local-skills.mjs" download>下载只读扫描脚本</a>
                <button type="button" className="button secondary" onClick={() => inventoryInputRef.current?.click()}>导入 inventory.json</button>
              </div>
            </div>
            <div className="filter-bar">
              <label className="search-field"><span className="sr-only">搜索 Skills</span><input value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} placeholder="搜索名称、仓库、用途或路径" /></label>
              <div className="segmented" aria-label="Skill 推荐层级">
                <button type="button" className={skillTier === "core" ? "is-active" : ""} onClick={() => setSkillTier("core")}>核心推荐（最多 12）</button>
                <button type="button" className={skillTier === "conditional" ? "is-active" : ""} onClick={() => setSkillTier("conditional")}>按条件使用</button>
                <button type="button" className={skillTier === "study" ? "is-active" : ""} onClick={() => setSkillTier("study")}>仅供学习</button>
              </div>
            </div>
            <div className="skills-grid">
              {filteredSkills.map((skill) => (
                <article className="skill-card" key={skill.id}>
                  <div className="skill-heading">
                    <div><span>{skill.publisher}</span><h2>{skill.name}</h2></div>
                    <div className="score-badge"><strong>{weightedSkillScore(skill)}</strong><span>综合分</span></div>
                  </div>
                  <div className="status-row">
                    <span className={`risk risk-${skill.risk}`}>{skill.risk === "low" ? "低风险" : skill.risk === "medium" ? "中风险" : "高风险"}</span>
                    <span>{skill.installType}</span>
                    {discoveredLocally(skill) && <span className="local-found">本机发现</span>}
                  </div>
                  <p>{skill.purpose}</p>
                  <dl>
                    <div><dt>GitHub</dt><dd>{skill.repo}</dd></div>
                    <div><dt>精确路径</dt><dd><code>{skill.path}</code></dd></div>
                    <div><dt>ref</dt><dd><code>{skill.ref}</code></dd></div>
                    <div><dt>许可证</dt><dd>{skill.license}</dd></div>
                    <div><dt>维护快照</dt><dd>{skill.maintenanceNote}</dd></div>
                    <div><dt>Issue / Release</dt><dd>{skill.issueReleaseNote}</dd></div>
                    <div><dt>适用阶段</dt><dd>{skill.stageIds.map((id) => `S${id}`).join(" · ")}</dd></div>
                  </dl>
                  <div className="skill-section"><h3>权限与外部动作</h3><ul>{skill.permissions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div className="skill-section"><h3>局限</h3><p>{skill.limitations}</p></div>
                  <div className="install-box">
                    <strong>安装 / 学习方式</strong>
                    <p>{skill.installNote}</p>
                    {skill.installCommand && (
                      <div className="command-row"><code>{skill.installCommand}</code><button type="button" onClick={async () => { await copyText(skill.installCommand || ""); setToast("安装命令已复制；运行前请先审查仓库。"); }}>复制</button></div>
                    )}
                  </div>
                  <footer><a href={skill.sourceUrl} target="_blank" rel="noreferrer">查看精确源码</a><span>核对 {skill.reviewedAt}</span></footer>
                </article>
              ))}
            </div>
            {filteredSkills.length === 0 && <p className="no-results">此分类没有匹配 Skill。</p>}
          </section>
        )}

        {view === "about" && (
          <section className="content-view about-view" aria-labelledby="about-title">
            <div className="view-heading"><div><p className="eyebrow">边界与更新原理</p><h1 id="about-title">这份公共版怎样保持可用、可迁移、不过度承诺</h1></div></div>
            <div className="about-grid">
              <article><h2>Spec 到底是什么</h2><p>Spec 是对目标、范围、约束、行为和验收的书面约定。它不是某个固定文件名，也不是写完就不再修改。新证据出现时，可以回到前一阶段修订，但每次变更要留下原因和影响。</p><button type="button" className="text-button" onClick={() => setTermDialog(GLOSSARY.find((item) => item.id === "spec") ?? null)}>打开 Spec 术语卡</button></article>
              <article><h2>怎样把工程化用进 Vibe Coding</h2><p>把架构师的判断变成 AI 可执行的上下文和门禁：Spec/ADR 约束范围，模块和数据契约约束边界，测试/Lint/CI 提供反馈，发布与回滚规则控制风险。工具不会替代兜底角色，但能让其判断反复执行。</p></article>
              <article><h2>Skills 不只来自 GitHub</h2><p>Codex Skill 也可能来自项目目录、个人目录、系统或 Plugin。本目录按公共版要求只列有 GitHub 源码的候选；“本机发现”来自你主动导入的只读清单，“当前会话可用”必须由当前代理环境确认。</p><a href="https://learn.chatgpt.com/docs/build-skills" target="_blank" rel="noreferrer">OpenAI · Build Skills</a></article>
              <article><h2>在线更新怎样工作</h2><p>维护者的白名单任务只读取 GitHub 元数据并生成报告或 PR；它不会自动把新仓库变成推荐。浏览器的“检查更新”只下载已经人工审核、带版本号的 JSON。离线时继续使用内置或最近缓存。</p></article>
              <article><h2>为什么单 HTML 也能工作</h2><p>离线快照把页面、样式、脚本和知识数据放在一个文件里，所以换电脑后可直接打开。Service Worker 只在 HTTPS 或 localhost 下工作；file:// 模式不依赖它，也无法在线自更新。</p><a href="offline.html" download>下载当前离线 HTML</a></article>
              <article><h2>隐私边界</h2><p>项目数据默认只写入浏览器 localStorage，可导出 JSON；公共构建不包含用户项目。发布前脚本会检查绝对本机路径、常见个人信息格式和本地 denylist，仍需人工复核语境。</p></article>
            </div>
            <div className="source-board">
              <h2>关键直接来源</h2>
              <div>
                <a href="https://learn.chatgpt.com/docs/build-skills" target="_blank" rel="noreferrer">OpenAI · Build Skills</a>
                <a href="https://learn.chatgpt.com/docs/build-plugins" target="_blank" rel="noreferrer">OpenAI · Build Plugins</a>
                <a href="https://github.com/openai/plugins" target="_blank" rel="noreferrer">openai/plugins</a>
                <a href="https://github.com/openai/skills" target="_blank" rel="noreferrer">openai/skills（已弃用说明）</a>
                <a href="https://github.com/vercel-labs/agent-skills" target="_blank" rel="noreferrer">vercel-labs/agent-skills</a>
                <a href="https://github.com/mattpocock/skills" target="_blank" rel="noreferrer">mattpocock/skills</a>
                <a href="https://github.com/addyosmani/agent-skills" target="_blank" rel="noreferrer">addyosmani/agent-skills</a>
                <a href="https://github.com/obra/superpowers" target="_blank" rel="noreferrer">obra/superpowers</a>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>AI 建站向导</span>
        <span>审核内容日期 2026-07-20</span>
        <button type="button" onClick={() => setView("about")}>查看事实、判断与更新边界</button>
      </footer>

      <input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => importProjectFile(event.target.files?.[0])} />
      <input ref={inventoryInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => importInventory(event.target.files?.[0])} />

      {wizardOpen && (
        <Wizard
          step={wizardStep}
          name={projectName}
          answers={draftAnswers}
          onNameChange={setProjectName}
          onAnswersChange={setDraftAnswers}
          onStepChange={setWizardStep}
          onClose={() => setWizardOpen(false)}
          onFinish={finishWizard}
        />
      )}

      {globalSearchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setGlobalSearchOpen(false); }}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
            <div className="modal-heading"><div><p className="eyebrow">全局搜索</p><h2 id="global-search-title">查术语、技术、提示词和 Skills</h2></div><button type="button" className="close-button" onClick={() => setGlobalSearchOpen(false)} aria-label="关闭搜索">关闭</button></div>
            <input ref={searchInputRef} value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="例如：Spec、PWA、权限、React、测试" />
            <div className="search-results" aria-live="polite">
              {!globalQuery && <p>输入关键词开始搜索。按 Esc 关闭。</p>}
              {globalQuery && globalResults.length === 0 && <p>没有结果。尝试更短的词或中文/英文别名。</p>}
              {globalResults.map((result) => (
                <button key={`${result.type}-${result.title}`} type="button" onClick={() => handleGlobalResult(result.action)}>
                  <span>{result.type}</span><strong>{result.title}</strong><small>{result.description}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {termDialog && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setTermDialog(null); }}>
          <article className="term-dialog" role="dialog" aria-modal="true" aria-labelledby="term-dialog-title">
            <div className="modal-heading"><div><p className="eyebrow">{termDialog.category} · {termDialog.level === "core" ? "新手核心" : "进阶"}</p><h2 id="term-dialog-title">{termDialog.term}</h2></div><button type="button" className="close-button" onClick={() => setTermDialog(null)}>关闭</button></div>
            {termDialog.aliases?.length ? <p className="aliases">也叫：{termDialog.aliases.join("、")}</p> : null}
            <section><h3>意思</h3><p>{termDialog.definition}</p></section>
            <section><h3>为什么与你的 Vibe Coding 有关</h3><p>{termDialog.whyItMatters}</p></section>
            <div className="term-meta"><span>{termDialog.claimType === "informal" ? "行业俗称 / 非正式" : termDialog.claimType === "engineering-judgment" ? "包含工程判断" : "事实定义"}</span><span>{termDialog.volatility === "changing" ? "易变化" : "相对稳定"}</span><span>核对 {termDialog.reviewedAt}</span></div>
            <a className="button secondary" href={termDialog.source.url} target="_blank" rel="noreferrer">查看来源：{termDialog.source.label}</a>
          </article>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Wizard({
  step,
  name,
  answers,
  onNameChange,
  onAnswersChange,
  onStepChange,
  onClose,
  onFinish,
}: {
  step: number;
  name: string;
  answers: ProjectAnswers;
  onNameChange: (value: string) => void;
  onAnswersChange: (answers: ProjectAnswers) => void;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  const titles = ["网站要做什么", "你从哪里开始", "有哪些高风险功能", "谁维护内容", "主要访问地域", "最优先考虑什么"];
  const canContinue = step !== 1 || name.trim().length > 0;
  return (
    <div className="modal-backdrop wizard-backdrop" role="presentation">
      <section className="wizard" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <div className="wizard-header">
          <div><p className="eyebrow">问题 {step} / 6</p><h2 id="wizard-title">{titles[step - 1]}</h2></div>
          <button type="button" className="close-button" onClick={onClose}>关闭</button>
        </div>
        <div className="wizard-progress" aria-label={`完成 ${step - 1} / 6`}><span style={{ width: `${((step - 1) / 6) * 100}%` }} /></div>
        <div className="wizard-body">
          {step === 1 && (
            <>
              <label className="project-name-field">项目名称<input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="例如：松林咖啡官网（虚构示例）" autoFocus /></label>
              <div className="option-grid">
                {WEBSITE_TYPES.map((item) => <OptionCard key={item.id} selected={answers.websiteType === item.id} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, websiteType: item.id })} testId={`type-${item.id}`} />)}
              </div>
            </>
          )}
          {step === 2 && <div className="option-grid">{START_POINTS.map((item) => <OptionCard key={item.id} selected={answers.startPoint === item.id} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, startPoint: item.id })} />)}</div>}
          {step === 3 && (
            <>
              <p className="wizard-help">可多选；如果都没有，直接下一步。高风险不等于不能做，只表示质量门更多。</p>
              <div className="option-grid">{FEATURES.map((item) => <OptionCard key={item.id} selected={answers.features.includes(item.id)} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, features: answers.features.includes(item.id) ? answers.features.filter((feature) => feature !== item.id) : [...answers.features, item.id] })} />)}</div>
            </>
          )}
          {step === 4 && <div className="option-grid">{CONTENT_OWNERS.map((item) => <OptionCard key={item.id} selected={answers.contentOwner === item.id} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, contentOwner: item.id })} />)}</div>}
          {step === 5 && <div className="option-grid">{REGIONS.map((item) => <OptionCard key={item.id} selected={answers.region === item.id} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, region: item.id })} />)}</div>}
          {step === 6 && <div className="option-grid">{PRIORITIES.map((item) => <OptionCard key={item.id} selected={answers.priority === item.id} title={item.label} description={item.description} onClick={() => onAnswersChange({ ...answers, priority: item.id })} />)}</div>}
        </div>
        <div className="wizard-footer">
          <button type="button" className="button secondary" disabled={step === 1} onClick={() => onStepChange(step - 1)}>上一步</button>
          {step < 6 ? <button type="button" className="button primary" disabled={!canContinue} onClick={() => onStepChange(step + 1)}>下一步</button> : <button type="button" className="button primary" onClick={onFinish} data-testid="finish-wizard">生成我的路线</button>}
        </div>
      </section>
    </div>
  );
}

function RouteView({
  project,
  onCreate,
  onExport,
  onImport,
  onDelete,
  onOpenPrompt,
  onStatusChange,
  onEvidenceChange,
  onGateToggle,
  onUpdateStageText,
  onOpenTerm,
}: {
  project: WebsiteProject;
  onCreate: () => void;
  onExport: () => void;
  onImport: () => void;
  onDelete: () => void;
  onOpenPrompt: () => void;
  onStatusChange: (stageId: number, status: StageStatus) => void;
  onEvidenceChange: (stageId: number, gateId: string, evidence: string) => void;
  onGateToggle: (stageId: number, gateId: string, passed: boolean) => void;
  onUpdateStageText: (stageId: number, field: "notApplicableReason" | "blocker", value: string) => void;
  onOpenTerm: (termId: string) => void;
}) {
  const progress = projectProgress(project);
  const current = currentStage(project);
  const next = nextAction(project);
  const routeOptions = [project.recommendation.primary, project.recommendation.simple, project.recommendation.scalable];

  const goToNext = () => {
    const target = document.getElementById(next.gateId ? `gate-${next.stage.id}-${next.gateId}` : `stage-${next.stage.id}`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="route-view" aria-labelledby="route-title">
      <div className="route-header">
        <div>
          <p className="eyebrow">你的建站路线</p>
          <h1 id="route-title">{project.name}</h1>
          <p>{projectSummary(project)}</p>
        </div>
        <div className="button-row compact">
          <button type="button" className="button secondary" onClick={onCreate}>新建项目</button>
          <button type="button" className="button secondary" onClick={onImport}>导入</button>
          <button type="button" className="button secondary" onClick={onExport}>导出 JSON</button>
          <button type="button" className="button danger" onClick={onDelete}>删除</button>
        </div>
      </div>

      <div className="route-overview">
        <article className="progress-card">
          <div><p className="eyebrow">总体进度</p><strong>{progress.percent}%</strong><span>{progress.passed} / {progress.total} 个适用 Gate 有证据并通过</span></div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percent}%` }} /></div>
          <p>当前阶段：{current.id}. {current.title}</p>
        </article>
        <article className={`risk-card risk-card-${project.recommendation.risk}`}>
          <p className="eyebrow">风险等级</p>
          <strong>{project.recommendation.risk === "low" ? "低" : project.recommendation.risk === "medium" ? "中" : "高"}</strong>
          <ul>{project.recommendation.riskReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </article>
        <article className="today-card">
          <p className="eyebrow">今天先做 3 件事</p>
          <ol>{project.recommendation.today.map((item) => <li key={item}>{item}</li>)}</ol>
        </article>
      </div>

      <details className="route-options" open>
        <summary>查看技术路线：首选、简化备选、可扩展备选</summary>
        <div className="route-option-grid">
          {routeOptions.map((option) => (
            <article key={option.title}><span>{option.title}</span><h2>{option.stack}</h2><p>{option.why}</p><div><strong>不适用：</strong>{option.avoidWhen}</div></article>
          ))}
        </div>
        <div className="constraint-list"><h3>附加约束</h3><ul>{project.recommendation.constraints.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </details>

      <div className="timeline-heading">
        <div><p className="eyebrow">八阶段时间轴</p><h2>路线可以返回修改，但每次通过都要有证据</h2></div>
        <p>已有项目的前序阶段默认是“待复核”，不会自动冒充完成。</p>
      </div>
      <ol className="stage-rail" aria-label="建站阶段">
        {STAGES.map((stage) => {
          const stageProgress = project.stages[String(stage.id)];
          const gates = applicableGates(project, stage);
          const passed = gates.filter((gate) => gateIsPassed(stageProgress.gates[gate.id])).length;
          return (
            <li key={stage.id} className={stage.id === current.id ? "is-current" : ""}>
              <span>{stage.id}</span>
              <div><strong>{stage.title}</strong><small>{passed} / {gates.length} Gate</small></div>
              <StatusBadge status={stageProgress.status} />
            </li>
          );
        })}
      </ol>

      <div className="stage-list">
        {STAGES.map((stage) => {
          const progressState = project.stages[String(stage.id)];
          const gates = applicableGates(project, stage);
          const isCurrent = stage.id === current.id;
          return (
            <details id={`stage-${stage.id}`} key={stage.id} className={`stage-card ${isCurrent ? "is-current" : ""}`} open={isCurrent}>
              <summary>
                <span className="stage-number">{String(stage.id).padStart(2, "0")}</span>
                <span><strong>{stage.title}</strong><small>{stage.plainGoal}</small></span>
                <StatusBadge status={progressState.status} />
              </summary>
              <div className="stage-body">
                <div className="stage-controls">
                  <label>阶段状态<select value={progressState.status} onChange={(event) => onStatusChange(stage.id, event.target.value as StageStatus)}>{Object.entries(STAGE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <div className="stage-terms"><span>相关术语</span>{(stageTermMap[stage.id] ?? []).map((termId) => { const term = GLOSSARY.find((item) => item.id === termId); return term ? <button key={termId} type="button" onClick={() => onOpenTerm(termId)}>{term.term}</button> : null; })}</div>
                </div>
                {progressState.status === "blocked" && <label className="stage-text-field">阻塞原因<textarea value={progressState.blocker} onChange={(event) => onUpdateStageText(stage.id, "blocker", event.target.value)} placeholder="缺少什么、谁能解决、需要什么新授权？" /></label>}
                {progressState.status === "not_applicable" && <label className="stage-text-field">不适用理由（必填）<textarea value={progressState.notApplicableReason} onChange={(event) => onUpdateStageText(stage.id, "notApplicableReason", event.target.value)} placeholder="为什么本项目不需要这一阶段？谁确认的？" />{!progressState.notApplicableReason.trim() && <small className="validation-inline">未填写理由前，不会从总体进度中排除。</small>}</label>}
                <div className="deliverables"><strong>本阶段产物</strong>{stage.deliverables.map((item) => <span key={item}>{item}</span>)}</div>
                <div className="gate-list">
                  {gates.map((gate) => {
                    const gateProgress = progressState.gates[gate.id];
                    return (
                      <article id={`gate-${stage.id}-${gate.id}`} className={`gate-row ${gateIsPassed(gateProgress) ? "is-passed" : ""}`} key={gate.id}>
                        <label className="gate-check"><input type="checkbox" checked={gateProgress.passed} onChange={(event) => onGateToggle(stage.id, gate.id, event.target.checked)} /><span><strong>{gate.title}</strong><small>{gate.help}</small></span></label>
                        <label className="evidence-field">证据链接或验收记录<input value={gateProgress.evidence} onChange={(event) => onEvidenceChange(stage.id, gate.id, event.target.value)} placeholder={gate.evidenceExample} /></label>
                      </article>
                    );
                  })}
                </div>
                <div className="stage-footer"><span>{stageCanBeDone(project, stage) ? "所有适用 Gate 已有证据，可提交验收。" : "完成条件：所有适用 Gate 必须有证据并通过。"}</span><button type="button" className="text-button" onClick={onOpenPrompt}>生成当前阶段提示词</button></div>
              </div>
            </details>
          );
        })}
      </div>

      <aside className="next-action" aria-label="唯一下一步行动">
        <div><p className="eyebrow">唯一下一步 · 阶段 {next.stage.id}</p><strong>{next.title}</strong><span>{next.detail}</span></div>
        <div className="button-row compact"><button type="button" className="button primary" onClick={goToNext}>去处理</button><button type="button" className="button secondary" onClick={onOpenPrompt}>生成提示词</button></div>
      </aside>
    </section>
  );
}
