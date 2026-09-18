/**
 * types/skill.ts
 *
 * Shared shape for a category in the Skills page's full inventory (see
 * pages/Skills.vue). Mirrors the pattern in types/project.ts — one place
 * for the data shape, so adding a new category or skill later is just
 * editing the array in Skills.vue.
 */
export interface SkillCategory {
  name: string
  skills: string[]
}
