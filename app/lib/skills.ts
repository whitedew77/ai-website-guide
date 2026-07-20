import catalogJson from "../../catalog/skills-reviewed.json";
import type { ReviewedSkillCatalog, SkillRecord } from "./types";

export const REVIEWED_SKILL_CATALOG = catalogJson as ReviewedSkillCatalog;
export const SKILLS: SkillRecord[] = REVIEWED_SKILL_CATALOG.skills;

export function weightedSkillScore(skill: SkillRecord): number {
  const { fit, maintenance, safety, clarity, portability, popularity } = skill.score;
  return Math.round(
    fit * 0.3 +
      maintenance * 0.2 +
      safety * 0.2 +
      clarity * 0.15 +
      portability * 0.1 +
      popularity * 0.05,
  );
}
