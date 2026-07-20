# AI 建站与部署：从想法到上线的零基础指南

**Building and Deploying Websites with AI: A Beginner's Guide from Idea to Launch**

[![Validate public build](https://github.com/whitedew77/ai-website-guide/actions/workflows/ci.yml/badge.svg)](https://github.com/whitedew77/ai-website-guide/actions/workflows/ci.yml)

[在线使用 AI 建站向导](https://whitedew77.github.io/ai-website-guide/)

一个面向零基础用户的本地优先交互式教程。它把“资料百科”整理成一条可以实际执行的路线：回答 6 个问题生成网站计划，按照 8 个阶段完成证据化质量 Gate，并随时使用提示词、技术与术语库以及经过人工审核的 GitHub Skill 目录。

> 当前教程内容以简体中文为主。英文标题用于国际检索，不代表目前已经提供完整英文译本。

## 它适合谁

- 想借助 Codex 等 AI 工具制作网站，但不知道第一步做什么的人；
- 需要把需求、设计、开发、测试和上线串成可验收流程的人；
- 希望项目数据留在本机，并能够导入、导出和离线使用的人；
- 想了解 GitHub Skills、技术选型和常见建站术语，但不想直接运行未知安装命令的人。

## 核心内容

- **6 问创建计划**：根据网站类型、起点、风险功能、内容维护者、访问地区和优先级生成路线。
- **8 阶段证据 Gate**：每个 Gate 必须同时具备证据和人工确认，不能只勾选完成。
- **条件化路线**：网站类型、功能、地区和风险会增加约束，不用一套固定清单冒充所有项目。
- **提示词生成器**：把项目背景、阶段目标和未知信息组合成可继续追问的提示词。
- **技术与术语库**：保留直接来源和核对日期，区分事实、工程判断和非正式行业用语。
- **经审核的 Skill 目录**：只展示经过人工检查的公开 GitHub 来源，不自动安装、不自动升级推荐。
- **本地优先数据**：项目保存在当前浏览器，支持 JSON 导入导出，不需要账号或服务端数据库。
- **PWA 与离线版**：可生成静态 PWA，以及一个自包含的单文件离线快照。

## 快速开始

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run dev
```

打开终端显示的本地地址后即可创建项目。项目仅保存在当前浏览器；换设备或清理浏览器数据前，请先使用页面中的“导出 JSON”。

## 构建与验证

```bash
npm test
npm run lint
npm run privacy:scan
```

完整测试会执行逻辑测试、生产构建、渲染与离线产物测试以及基础隐私扫描。构建会生成：

- 可直接托管的静态 PWA：`dist/client/`；
- 单文件离线快照：`public/offline.html`；
- 同步后的审核 Skill JSON；
- 服务端构建产物和托管元数据。

自动隐私扫描是防护网，不是“绝对没有泄露”的证明。公开截图、示例、来源和构建产物仍需人工复核。

## 主要目录

- `app/lib/workflow-content.ts`：六问、八阶段和提示词内容。
- `app/lib/knowledge.ts`：有直接来源和核对日期的技术与术语。
- `catalog/skills-reviewed.json`：人工审核后的 GitHub Skill 目录。
- `scripts/update-skill-metadata.mjs`：只读取白名单仓库元数据并生成评审报告。
- `public/tools/scan-local-skills.mjs`：用户可下载的本机只读发现脚本。
- `docs/CONTENT-AUDIT.md`：公开内容的删除、修正、来源和已知限制记录。
- `docs/MAINTENANCE.md`：更新、评分、隐私和发布边界。

## 数据与隐私边界

- 不建立账号，不把用户项目上传到公共服务器；
- 不在网页中执行安装命令或保存 GitHub Token；
- 不包含真实个人、公司、客户、测试数据或内部项目案例；
- 不把本机绝对路径、API Key、密码或访问令牌写入源码、示例和 Git 历史；
- 新发现的 Skill 只能先生成评审证据，不能自动变成推荐。

如需扫描项目专属敏感词，可设置逗号分隔的 `SOP_PRIVATE_TERMS`，或创建被 Git 忽略的 `.privacy-denylist.local`，每行填写一个词。

## 内容审核与已知限制

项目中的版本、价格、星数和维护状态都可能变化，不作为永久事实。目录更新自动化只创建元数据评审材料，不会自动修改人工审核后的推荐目录。

`main` 分支通过测试后，会把静态产物 `dist/client/` 部署到 GitHub Pages。自定义域名、分析统计、表单和公共用户数据收集仍需要单独决策与授权。详见 [`docs/CONTENT-AUDIT.md`](docs/CONTENT-AUDIT.md) 和 [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md)。

## 许可证

- 软件源代码和软件资源采用 [MIT License](LICENSE)。
- 原创教程文字、文档、提示词内容和目录注释采用 [Creative Commons Attribution 4.0 International](LICENSE-CONTENT)。
- 第三方项目名称、商标、链接、引用和代码仍受各自权利人与许可证约束。

OpenAI 的归档仓库 [`openai/skills`](https://github.com/openai/skills) 不作为当前示例目录；当前公开示例主要从 [`openai/plugins`](https://github.com/openai/plugins) 等白名单仓库进行人工审核。
