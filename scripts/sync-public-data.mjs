import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const targetDir = resolve(projectRoot, "public/catalog");

await mkdir(targetDir, { recursive: true });
await copyFile(
  resolve(projectRoot, "catalog/skills-reviewed.json"),
  resolve(targetDir, "skills-reviewed.json"),
);
