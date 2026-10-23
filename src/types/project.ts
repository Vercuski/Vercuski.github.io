/**
 * types/project.ts
 *
 * Shared shape for a project card (see components/ProjectCard.vue and
 * pages/Projects.vue). Pulling this into one place means adding a new
 * project going forward is just appending an object to the array in
 * Projects.vue — no markup duplication.
 */
export interface Project {
  /** Repository name shown as the card title; also the list key. */
  repoName: string
  /** Imported image URL for the card's avatar. */
  icon: string
  /** Alt text for {@link Project.icon}. */
  iconAlt: string
  /** What the project is and why it is useful. */
  description: string
  /** Framework chip, e.g. '.NET 9'. */
  framework: string
  /** Language chip, e.g. 'C#'. */
  language: string
  /** Link to the repository on GitHub. */
  githubUrl: string
}
