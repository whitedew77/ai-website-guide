import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const ignoredDirectories = new Set([".git", ".next", ".vinext", ".wrangler", "node_modules", "dist", "outputs", "work"]);
const scannedExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".webmanifest", ".yaml", ".yml"]);

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (scannedExtensions.has(extname(entry.name)) && entry.name !== "package-lock.json") files.push(path);
  }
  return files;
}

const patterns = [
  { id: "absolute-macos-user-path", regex: new RegExp(["", "Users", "[^/\\s]+", ""].join("/"), "g") },
  { id: "absolute-linux-home-path", regex: new RegExp(["", "home", "[^/\\s]+", ""].join("/"), "g") },
  { id: "absolute-windows-user-path", regex: new RegExp(["C:", "Users", "[^\\\\\\s]+", ""].join("\\\\"), "gi") },
  { id: "email-address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { id: "mainland-mobile-number", regex: /(?<!\d)1[3-9]\d{9}(?!\d)/g },
  { id: "private-ip-address", regex: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g }
];

const privateTerms = new Set(
  (process.env.SOP_PRIVATE_TERMS || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
);
const localDenylist = join(projectRoot, ".privacy-denylist.local");
if (await exists(localDenylist)) {
  for (const line of (await readFile(localDenylist, "utf8")).split(/\r?\n/)) {
    const term = line.trim();
    if (term && !term.startsWith("#")) privateTerms.add(term);
  }
}

const findings = [];
for (const file of await walk(projectRoot)) {
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) findings.push({ file: relative(projectRoot, file), line: index + 1, rule: pattern.id });
    }
    for (const term of privateTerms) {
      if (line.toLocaleLowerCase().includes(term.toLocaleLowerCase())) {
        findings.push({ file: relative(projectRoot, file), line: index + 1, rule: "local-private-term" });
      }
    }
  }
}

if (findings.length) {
  process.stderr.write("Privacy scan failed. Matched locations are listed without echoing private content:\n");
  for (const finding of findings) process.stderr.write(`- ${finding.file}:${finding.line} (${finding.rule})\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Privacy scan passed with zero findings.\n");
}
