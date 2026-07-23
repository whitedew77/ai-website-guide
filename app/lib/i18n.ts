import type { Locale } from "./types";

export const LANGUAGE_STORAGE_KEY = "ai-website-guide-language-v1";

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; title: string; description: string; dateLocale: string }
> = {
  zh: {
    htmlLang: "zh-CN",
    title: "AI 建站向导：6 问生成网站规划、开发与部署路线",
    description: "回答 6 个问题，生成从需求规划、技术选型、开发测试到部署上线的 8 阶段 AI 建站路线。",
    dateLocale: "zh-CN",
  },
  en: {
    htmlLang: "en",
    title: "AI Website Roadmap Builder: Plan, Build, Test, and Deploy",
    description:
      "Answer six questions to create an eight-stage AI website roadmap from requirements and technology choices through development, testing, and deployment.",
    dateLocale: "en",
  },
};

export function localeFromSearch(search: string): Locale | null {
  const value = new URLSearchParams(search).get("lang");
  return value === "zh" || value === "en" ? value : null;
}

export function localeFromBrowser(language: string): Locale {
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function localizedList(items: string[], locale: Locale): string {
  return items.join(locale === "en" ? ", " : "、");
}

const ENGLISH_UI: Record<string, string> = {
  首页: "Home",
  我的路线: "My Roadmap",
  提示词: "Prompts",
  技术: "Technologies",
  术语: "Glossary",
  关于: "About",
  在线: "Online",
  离线: "Offline",
  搜索: "Search",
  中文: "中文",
  英文: "English",
  关闭: "Close",
  上一步: "Back",
  下一步: "Next",
  导入: "Import",
  删除: "Delete",
  复制: "Copy",
  下载: "Download",
  全部: "All",
  新手核心: "Core",
  进阶: "Advanced",
  低: "Low",
  中: "Medium",
  高: "High",
  尚未创建项目: "No project yet",
  "先回答 6 个问题，系统才能给你适用的路线":
    "Answer six questions to generate a roadmap that fits your project",
  "不会自动上传资料，也不会把浏览器中的项目写进公共网站。":
    "Nothing is uploaded automatically, and browser projects are never written to the public website.",
  创建新网站计划: "Create a website plan",
  "导入项目 JSON": "Import project JSON",
  "AI 建站向导": "AI Website Roadmap Builder",
  "6 问生成路线 · 8 阶段证据 Gate": "Six questions · Eight evidence-gated stages",
  "一个真正能执行的 AI 建站路线，而不是一堆资料":
    "An executable AI website roadmap, not another pile of resources",
  "回答 6 个问题，得到适合你的网站路线、唯一下一步和可复核的质量 Gate。项目只保存在当前浏览器。":
    "Answer six questions to get a tailored roadmap, one next action, and reviewable quality gates. Projects stay in this browser.",
  "开始创建计划": "Create a plan",
  "查看工作方式": "See how it works",
  "项目只保存在此浏览器": "Projects stay in this browser",
  "不会上传到公共服务器；请定期导出 JSON 备份。":
    "Nothing is uploaded to a public server. Export JSON backups regularly.",
  "为什么不是“一键生成网站”": "Why this is not a one-click website generator",
  "AI 能快速生成代码和内容，但不能替你确认真实业务、客户授权、安全边界或上线责任。":
    "AI can generate code and content quickly, but it cannot confirm real business facts, customer authorization, security boundaries, or launch ownership for you.",
  "先问清楚": "Clarify first",
  "用 6 个问题确定网站类型、起点、风险、内容维护、地域和优先级。":
    "Six questions define the site type, starting point, risk, content ownership, region, and priority.",
  "再分阶段": "Work in stages",
  "从目标到运营共 8 个阶段；已有材料不会自动被当成已验收。":
    "Eight stages cover goals through operations. Existing materials never count as accepted evidence automatically.",
  "每步有证据": "Require evidence",
  "每个 Gate 都要填写链接或验收记录，再由人明确确认。":
    "Every gate needs a link or acceptance note, followed by explicit human confirmation.",
  "最后可恢复": "Keep it recoverable",
  "项目可导出 JSON；上线必须有监控、回滚和负责人。":
    "Projects export to JSON, and launch requires monitoring, rollback, and named owners.",
  "你会得到什么": "What you get",
  "条件化技术路线": "Condition-aware technology routes",
  "根据网站类型、风险、内容维护者和地域给出首选、简化和扩展方案。":
    "Primary, simpler, and scalable options based on site type, risk, content ownership, and region.",
  "可追问的提示词": "Prompts that ask before assuming",
  "把项目背景、已知资料、未知项、交付物、验收和停止条件组合成可复制 Markdown。":
    "Combine project context, knowns, unknowns, deliverables, acceptance criteria, and stop conditions into copyable Markdown.",
  "来源化知识库": "Source-backed knowledge",
  "技术、术语和人工审核的 GitHub Skills 都保留直接来源与核对日期。":
    "Technologies, glossary terms, and reviewed GitHub Skills retain direct sources and review dates.",
  "离线与 PWA": "Offline and PWA",
  "静态站可安装；另提供单文件离线快照，浏览器本地数据不会被打包。":
    "The static site is installable, and a single-file offline snapshot is available. Browser-local projects are never bundled.",
  "数据保存在什么地方？": "Where is project data stored?",
  "项目默认写入当前浏览器的 localStorage。关闭网页不会立即丢失；清理站点数据、无痕模式结束或换设备会丢失。":
    "Projects are stored in this browser's localStorage. Closing the page does not erase them, but clearing site data, ending a private-browsing session, or changing devices does.",
  "先导出 JSON，再清理浏览器或换设备。公共 GitHub Pages 只托管程序，不保存你的项目。":
    "Export JSON before clearing browser data or changing devices. Public GitHub Pages hosts only the application, not your projects.",
  "网站计划已创建。下一步只需处理系统标出的一个 Gate。":
    "Website plan created. Work on the single gate highlighted as the next action.",
  "项目已导入；此前阶段仍需按证据复核。":
    "Project imported. Earlier stages still require evidence-based review.",
  "项目 JSON 已导出；文件只包含你当前浏览器中的这个项目。":
    "Project JSON exported. The file contains only this project from your current browser.",
  "项目已从此浏览器删除；未导出的内容无法在页面中恢复。":
    "Project deleted from this browser. Content that was not exported cannot be restored in the app.",
  "还不能标记完成：先为所有适用 Gate 填写证据并通过验收。":
    "This stage cannot be marked done yet. Add evidence and pass every applicable gate first.",
  "先填写证据链接或验收记录，再标记 Gate 通过。":
    "Add an evidence link or acceptance note before passing the gate.",
  "使用随页面发布的已审核目录": "Using the reviewed catalog bundled with this release",
  "当前离线；继续使用最近一次已审核目录":
    "You are offline. The most recent reviewed catalog remains in use.",
  "正在检查已审核目录…": "Checking the reviewed catalog…",
  "检查失败；继续使用最近一次已审核目录":
    "The check failed. The most recent reviewed catalog remains in use.",
  "已导入本机发现清单。它不代表当前会话一定可调用这些 Skills。":
    "Local discovery inventory imported. It does not prove that these Skills are callable in this session.",
  "全局搜索": "Global search",
  "查术语、技术、提示词和 Skills": "Search glossary terms, technologies, prompts, and Skills",
  "输入关键词开始搜索。按 Esc 关闭。": "Enter a keyword to search. Press Esc to close.",
  "没有结果。尝试更短的词或中文/英文别名。":
    "No results. Try a shorter term or a Chinese/English alias.",
  "意思": "Meaning",
  "为什么与你的 Vibe Coding 有关": "Why it matters for AI-assisted building",
  "行业俗称 / 非正式": "Informal industry term",
  "包含工程判断": "Includes engineering judgment",
  "事实定义": "Factual definition",
  "易变化": "Likely to change",
  "相对稳定": "Relatively stable",
  "你的建站路线": "Your website roadmap",
  "新建项目": "New project",
  "导出 JSON": "Export JSON",
  "总体进度": "Overall progress",
  "风险等级": "Risk level",
  "今天先做 3 件事": "Three things to do today",
  "查看技术路线：首选、简化备选、可扩展备选":
    "Technology routes: primary, simpler, and scalable",
  "不适用：": "Avoid when:",
  "附加约束": "Additional constraints",
  "八阶段时间轴": "Eight-stage timeline",
  "路线可以返回修改，但每次通过都要有证据":
    "You can revise earlier work, but every pass requires evidence",
  "已有项目的前序阶段默认是“待复核”，不会自动冒充完成。":
    "Earlier stages in an existing project default to review and never pretend to be complete.",
  "阶段状态": "Stage status",
  "相关术语": "Related terms",
  "阻塞原因": "Blocker",
  "不适用理由（必填）": "Why this stage does not apply (required)",
  "未填写理由前，不会从总体进度中排除。":
    "This stage remains in overall progress until a reason is provided.",
  "本阶段产物": "Stage deliverables",
  "证据链接或验收记录": "Evidence link or acceptance note",
  "所有适用 Gate 已有证据，可提交验收。":
    "Every applicable gate has evidence and can be submitted for review.",
  "完成条件：所有适用 Gate 必须有证据并通过。":
    "Completion requires evidence and approval for every applicable gate.",
  "生成当前阶段提示词": "Generate a prompt for this stage",
  "去处理": "Open next action",
  "生成提示词": "Generate prompt",
  "未开始": "Not started",
  "进行中": "In progress",
  "被阻塞": "Blocked",
  "待验收 / 待复核": "Awaiting review",
  "已完成": "Done",
  "不适用": "Not applicable",
  "网站要做什么": "What are you building?",
  "你从哪里开始": "Where are you starting?",
  "有哪些高风险功能": "Which high-risk features are involved?",
  "谁维护内容": "Who maintains the content?",
  "主要访问地域": "Where are the main visitors?",
  "最优先考虑什么": "What is the top priority?",
  "项目名称": "Project name",
  "可多选；如果都没有，直接下一步。高风险不等于不能做，只表示质量门更多。":
    "Select any that apply. High risk does not mean impossible; it means more quality gates.",
  "生成我的路线": "Generate my roadmap",
  "当前离线": "Currently offline",
  "查看来源：": "View source:",
  "核对": "Reviewed",
};

export function ui(locale: Locale, chinese: string): string {
  if (locale === "zh") return chinese.replaceAll("_", " ");
  return (ENGLISH_UI[chinese] ?? chinese).replaceAll("_", " ");
}
