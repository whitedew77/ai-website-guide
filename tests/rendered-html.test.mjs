import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public beginner entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>AI 建站向导 · Spec 到上线的 SOP<\/title>/i);
  assert.match(html, /回答 6 个问题/);
  assert.match(html, /创建新网站计划/);
  assert.match(html, /继续 \/ 导入已有项目/);
  assert.match(html, /查技术、术语和 Skills/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("build contains a self-contained offline snapshot and reviewed catalog", async () => {
  const offlineUrl = new URL("../public/offline.html", import.meta.url);
  const staticIndexUrl = new URL("../dist/client/index.html", import.meta.url);
  const catalogUrl = new URL("../public/catalog/skills-reviewed.json", import.meta.url);
  const manifestUrl = new URL("../dist/client/manifest.webmanifest", import.meta.url);
  const serviceWorkerUrl = new URL("../dist/client/sw.js", import.meta.url);
  await access(offlineUrl);
  await access(staticIndexUrl);
  await access(catalogUrl);
  const [offline, offlineInfo, staticIndex, catalog, manifestText, serviceWorker] = await Promise.all([
    readFile(offlineUrl, "utf8"),
    stat(offlineUrl),
    readFile(staticIndexUrl, "utf8"),
    readFile(catalogUrl, "utf8"),
    readFile(manifestUrl, "utf8"),
    readFile(serviceWorkerUrl, "utf8"),
  ]);
  assert.ok(offlineInfo.size > 100_000, "offline HTML should contain bundled app code and data");
  assert.match(offline, /<style>[\s\S]+<\/style>/);
  assert.match(offline, /<script>[\s\S]+<\/script>/);
  assert.doesNotMatch(offline, /<script[^>]+src=|<link[^>]+stylesheet/i);
  assert.match(offline, /AI 建站向导/);
  assert.match(staticIndex, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.doesNotMatch(staticIndex, /<script[^>]+src=|<link[^>]+stylesheet/i);
  const parsed = JSON.parse(catalog);
  assert.equal(parsed.reviewStatus, "reviewed");
  assert.ok(Array.isArray(parsed.skills) && parsed.skills.length >= 12);
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.start_url, "./");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.match(serviceWorker, /new URL\(path, self\.location\.href\)/);
});
