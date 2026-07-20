import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const whitelist = JSON.parse(await readFile(resolve(projectRoot, "catalog/skill-repositories.json"), "utf8"));
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "ai-website-sop-catalog-updater",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};

async function fetchRepository(repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${repo}`);
  const data = await response.json();
  return {
    repo,
    defaultBranch: data.default_branch,
    archived: Boolean(data.archived),
    disabled: Boolean(data.disabled),
    pushedAt: data.pushed_at,
    updatedAt: data.updated_at,
    openIssuesCount: data.open_issues_count,
    license: data.license?.spdx_id ?? null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    htmlUrl: data.html_url
  };
}

const fetchedAt = new Date().toISOString();
const repositories = await Promise.all(whitelist.repositories.map((entry) => fetchRepository(entry.repo)));
const metadata = {
  schemaVersion: 1,
  fetchedAt,
  source: "GitHub REST API",
  note: "Metadata is informational and does not change recommendation status.",
  repositories
};

const catalogDir = resolve(projectRoot, "catalog");
const reportsDir = resolve(projectRoot, "reports");
await mkdir(catalogDir, { recursive: true });
await mkdir(reportsDir, { recursive: true });
await writeFile(resolve(catalogDir, "repository-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

const rows = repositories.map((repo) =>
  `| ${repo.repo} | ${repo.archived ? "yes" : "no"} | ${repo.license ?? "unknown"} | ${repo.pushedAt ?? "unknown"} | ${repo.openIssuesCount} | ${repo.stars} |`
);
const report = [
  "# Skill catalog metadata report",
  "",
  `Generated: ${fetchedAt}`,
  "",
  "> This report never promotes a repository or Skill automatically. A reviewer must inspect source, paths, scripts, permissions and license, then intentionally edit `catalog/skills-reviewed.json`.",
  "",
  "| Repository | Archived | License | Last push | Open issues | Stars (snapshot) |",
  "|---|---:|---|---|---:|---:|",
  ...rows,
  "",
  "## Reviewer checklist",
  "",
  "- Confirm the exact Skill path still exists at the reviewed ref.",
  "- Inspect new scripts, Shell commands, network use, credentials and external writes.",
  "- Compare license and maintenance changes.",
  "- Re-score task fit, maintenance, safety, clarity, portability and popularity.",
  "- Change recommendation tier only after a human review."
].join("\n");
await writeFile(resolve(reportsDir, "skill-catalog-update.md"), `${report}\n`, "utf8");
process.stdout.write(`Updated metadata report for ${repositories.length} whitelisted repositories.\n`);
