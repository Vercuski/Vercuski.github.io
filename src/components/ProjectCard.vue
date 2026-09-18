<template>
  <v-card
    class="project-card mx-auto"
    rounded="lg"
    elevation="2"
    style="max-width: 340px; overflow: hidden;"
  >
    <v-card-item class="pb-2">
      <div class="d-flex align-center">
        <v-avatar size="56" color="primary" variant="tonal" class="mr-4">
          <v-img :src="project.icon" :alt="project.iconAlt" cover />
        </v-avatar>
        <div>
          <div class="text-overline text-medium-emphasis" style="line-height: 1.2">Repository</div>
          <div class="text-body-1 font-weight-bold">{{ project.repoName }}</div>
        </div>
      </div>
    </v-card-item>

    <v-card-item
      class="py-4"
      style="background-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));"
    >
      <p class="text-subtitle-1 font-weight-bold mb-2">Description</p>
      <p class="text-body-2">{{ project.description }}</p>
      <div class="d-flex flex-wrap mt-4" style="gap: 8px">
        <v-chip size="small" color="white" variant="flat" class="text-primary font-weight-medium">
          {{ project.framework }}
        </v-chip>
        <v-chip size="small" color="white" variant="flat" class="text-primary font-weight-medium">
          {{ project.language }}
        </v-chip>
      </div>
    </v-card-item>

    <v-card-item class="d-flex align-center justify-space-between py-2">
      <span class="text-caption text-medium-emphasis">View source</span>
      <a
        :href="project.githubUrl"
        target="_blank"
        class="github-link d-flex align-center"
        :aria-label="`View ${project.repoName} on GitHub`"
      >
        <img
          :src="githubMark"
          :alt="`View ${project.repoName} on GitHub`"
          width="26"
          height="26"
        />
      </a>
    </v-card-item>
  </v-card>
</template>

<script lang="ts" setup>
import githubMark from '../assets/icons/github-mark.png'
import type { Project } from '../types/project'

defineProps<{
  project: Project
}>()
</script>

<style scoped>
.project-card {
  border-top: 4px solid rgb(var(--v-theme-primary));
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.project-card:hover {
  transform: translateY(-4px);
}

.github-link {
  transition: transform 0.15s ease;
}

.github-link:hover {
  transform: scale(1.12);
}
</style>
