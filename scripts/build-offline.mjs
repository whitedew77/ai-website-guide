import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const result = await build({
  entryPoints: [resolve(projectRoot, "app/offline-entry.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  jsx: "automatic",
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  loader: {
    ".json": "json",
    ".png": "dataurl"
  }
});

const script = result.outputFiles[0]?.text;
if (!script) throw new Error("Offline JavaScript bundle was not produced.");

const css = await readFile(resolve(projectRoot, "app/globals.css"), "utf8");
const safeCss = css.replaceAll("</style", "<\\/style");
const safeScript = script.replaceAll("</script", "<\\/script");
const siteUrl = "https://whitedew77.github.io/ai-website-guide/";
const siteName = "AI 建站向导 / AI Website Roadmap Builder";
const siteTitle = "AI 建站向导：6 问生成网站规划、开发与部署路线";
const siteDescription = "中英双语、本地优先的 AI 建站路线生成器。Answer six questions to plan, build, test, and deploy a website through eight evidence-gated stages.";
const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  alternateName: "AI Website Roadmap Builder",
  url: siteUrl,
  description: siteDescription,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any device with a modern web browser",
  isAccessibleForFree: true,
  inLanguage: ["zh-CN", "en"],
  featureList: [
    "六问生成 AI 建站路线",
    "八阶段证据 Gate",
    "提示词生成器",
    "本地浏览器保存与 JSON 导入导出",
    "PWA 与单文件离线版",
    "Complete Simplified Chinese and English interface",
    "Six-question planning wizard and eight evidence-gated stages"
  ]
}).replaceAll("<", "\\u003c");
function renderHtml({ offline }) {
  const title = offline ? "AI 建站向导：网站规划与部署路线 · 离线版" : siteTitle;
  const description = offline
    ? "AI 建站向导离线快照：六问生成路线、八阶段证据 Gate、提示词、技术、术语与 GitHub Skills。"
    : siteDescription;
  const onlineMetadata = offline ? "" : `  <meta name="application-name" content="${siteName}">
  <link rel="canonical" href="${siteUrl}">
  <link rel="alternate" hreflang="zh-CN" href="${siteUrl}?lang=zh">
  <link rel="alternate" hreflang="en" href="${siteUrl}?lang=en">
  <link rel="alternate" hreflang="x-default" href="${siteUrl}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${siteTitle}">
  <meta property="og:description" content="${siteDescription}">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:locale:alternate" content="en_US">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${siteTitle}">
  <meta name="twitter:description" content="${siteDescription}">
  <script type="application/ld+json">${structuredData}</script>
`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#2864dc">
  <meta name="description" content="${description}">
${onlineMetadata}
  <link rel="icon" href="icon-192.png" type="image/png">
${offline ? "" : '  <link rel="manifest" href="manifest.webmanifest">\n'}  <title>${title}</title>
  <style>${safeCss}</style>
</head>
<body>
  <div id="root"></div>
  <script>${safeScript}</script>
</body>
</html>`;
}

await mkdir(resolve(projectRoot, "public"), { recursive: true });
await Promise.all([
  writeFile(resolve(projectRoot, "public/offline.html"), renderHtml({ offline: true }), "utf8"),
  writeFile(resolve(projectRoot, "public/index.html"), renderHtml({ offline: false }), "utf8"),
]);
