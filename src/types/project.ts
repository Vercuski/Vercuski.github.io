/**
 * types/project.ts
 *
 * Shared shape for a project card (see components/ProjectCard.vue and
 * pages/Projects.vue). Pulling this into one place means adding a new
 * project going forward is just appending an object to the array in
 * Projects.vue — no markup duplication.
 */
export interface Project {
  repoName: string
  icon: string
  iconAlt: string
  description: string
  framework: string
  language: string
  githubUrl: string
}
