import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const ignoredDirectories = new Set([".git", ".next", ".vinext", ".wrangler", "node_modules", "dist", "outputs", "work"]);

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
    else if (entry.name !== ".privacy-denylist.local") files.push(path);
  }
  return files;
}

const patterns = [
  { id: "absolute-macos-user-path", regex: new RegExp(["", "Users", "[^/\\s]+", ""].join("/"), "g") },
  { id: "absolute-linux-home-path", regex: new RegExp(["", "home", "[^/\\s]+", ""].join("/"), "g") },
  { id: "absolute-windows-user-path", regex: new RegExp(["C:", "Users", "[^\\\\\\s]+", ""].join("\\\\"), "gi") },
  { id: "email-address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { id: "mainland-mobile-number", regex: /(?<!\d)1[3-9]\d{9}(?!\d)/g },
  { id: "private-ip-address", regex: /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g },
  { id: "private-key-block", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { id: "github-access-token", regex: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g },
  { id: "openai-style-secret", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "google-api-key", regex: /\bAIza[0-9A-Za-z_-]{30,}\b/g },
  { id: "slack-token", regex: /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/g },
  { id: "stripe-live-key", regex: /\b(?:sk|rk|pk)_live_[0-9A-Za-z]{16,}\b/g },
  { id: "npm-token", regex: /\bnpm_[A-Za-z0-9]{20,}\b/g },
  { id: "gitlab-token", regex: /\bglpat-[A-Za-z0-9_-]{20,}\b/g },
  { id: "jwt", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { id: "credentialed-url", regex: /https?:\/\/[^/\s:@]+:[^/\s@]+@/g },
  { id: "bearer-token", regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/g },
  { id: "url-secret-parameter", regex: /[?&](?:token|key|secret|password)=[^&\s]{12,}/gi },
  {
    id: "secret-assignment",
    regex: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd|pwd)\b\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}/gi
  }
];

const sensitiveFileNames = [
  { id: "environment-file", regex: /(^|\/)\.env(?:\.|$)/i },
  { id: "private-key-file", regex: /(^|\/)(?:id_(?:rsa|dsa|ecdsa|ed25519)|[^/]+\.(?:pem|key|p12|pfx|jks|keystore))$/i },
  { id: "credential-file", regex: /(^|\/)(?:credentials(?:\.[^/]*)?|secrets?(?:\.[^/]*)?|\.npmrc|\.netrc)$/i },
  { id: "os-metadata-file", regex: /(^|\/)\.DS_Store$/i }
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
  const relativeFile = relative(projectRoot, file);
  for (const pattern of sensitiveFileNames) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(relativeFile)) findings.push({ file: relativeFile, line: 1, rule: pattern.id });
  }

  const buffer = await readFile(file);
  if (buffer.includes(0)) continue;
  const text = buffer.toString("utf8");
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) findings.push({ file: relativeFile, line: index + 1, rule: pattern.id });
    }
    for (const term of privateTerms) {
      if (line.toLocaleLowerCase().includes(term.toLocaleLowerCase())) {
        findings.push({ file: relativeFile, line: index + 1, rule: "local-private-term" });
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
