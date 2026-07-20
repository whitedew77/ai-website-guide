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
function renderHtml({ offline }) {
  const title = offline ? "AI 建站向导 · 离线版" : "AI 建站向导 · Spec 到上线的 SOP";
  const description = offline
    ? "AI 建站向导离线快照：六问路线、八阶段 SOP、提示词、技术、术语与 GitHub Skills。"
    : "面向零基础用户的 AI 网站制作向导：六问建站路线、证据化八阶段 SOP、提示词、技术、术语与 GitHub Skills。";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#2864dc">
  <meta name="description" content="${description}">
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
