#!/usr/bin/env node
import { access, readdir, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? resolve(args[outputIndex + 1] || "inventory.json") : resolve("inventory.json");
const projectRoot = process.cwd();
const roots = [
  { path: join(projectRoot, ".agents", "skills"), sourceKind: "project-agents" },
  { path: join(projectRoot, ".codex", "skills"), sourceKind: "project-codex" },
  { path: join(homedir(), ".agents", "skills"), sourceKind: "user-agents" },
  { path: join(homedir(), ".codex", "skills"), sourceKind: "codex-user" },
  { path: join(homedir(), ".codex", "plugins"), sourceKind: "codex-plugin" },
  { path: "/etc/codex/skills", sourceKind: "admin" }
];

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function findSkillFiles(root, depth = 0) {
  if (depth > 8 || !(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") && depth > 0) continue;
    const path = join(root, entry.name);
    if (entry.isFile() && entry.name === "SKILL.md") found.push(path);
    if (entry.isDirectory()) found.push(...(await findSkillFiles(path, depth + 1)));
  }
  return found;
}

const skills = [];
for (const root of roots) {
  for (const file of await findSkillFiles(root.path)) {
    const info = await stat(file);
    skills.push({
      name: basename(resolve(file, "..")),
      path: file,
      sourceKind: root.sourceKind,
      modifiedAt: info.mtime.toISOString()
    });
  }
}

const inventory = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "local-readonly-scan",
  note: "本机发现不等于当前会话可调用。脚本只读取目录结构，不读取 SKILL.md 内容，也不联网。",
  skills
};

await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote ${skills.length} discovered skill entries to ${outputPath}\n`);
