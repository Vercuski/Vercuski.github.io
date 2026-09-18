<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h4 text-center" style="font-weight: bold">SKILLS</span>
    </v-row>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h6 text-center" style="font-weight: bold">
        A list of skills I've picked up over the years, ranked top to bottom of
        familiarity.
      </span>
    </v-row>
    <br/><br/>

    <!-- Core Expertise: a curated set of headline skills, called out up
         front so a visitor skimming for a few seconds sees what matters
         most before scrolling to the full inventory below. -->
    <v-row class="justify-center">
      <v-col cols="12" lg="10" xl="8">
        <div
          class="pa-6 rounded-lg"
          style="background-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));"
        >
          <div class="text-overline mb-3" style="opacity: 0.75; letter-spacing: 0.1em;">
            Core Expertise
          </div>
          <div class="d-flex flex-wrap" style="gap: 12px">
            <v-chip
              v-for="skill in coreSkills"
              :key="skill"
              size="large"
              color="white"
              variant="flat"
              class="text-primary font-weight-bold"
            >
              {{ skill }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <br/><br/>

    <!-- Full inventory: the complete, categorized list for anyone who
         scrolls past the headline skills above. -->
    <v-row class="justify-center">
      <v-col cols="12" lg="10" xl="8">
        <div class="text-overline text-medium-emphasis mb-2">Full Skill Inventory</div>
      </v-col>
    </v-row>
    <v-row class="align-start justify-center">
      <v-col cols="12" lg="10" xl="8">
        <v-row>
          <v-col
            v-for="category in categories"
            :key="category.name"
            cols="12"
            sm="6"
            md="4"
          >
            <div class="text-overline font-weight-bold mb-2">{{ category.name }}</div>
            <div class="d-flex flex-wrap" style="gap: 8px">
              <v-chip
                v-for="skill in category.skills"
                :key="skill"
                size="small"
                color="secondary"
                variant="tonal"
                label
              >
                {{ skill }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <br/>
  </v-container>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import type { SkillCategory } from '../types/skill'

useHead({
  title: 'Skills | Scott Vercuski',
  meta: [
    {
      name: 'description',
      content: 'Technical skills and expertise of Scott Vercuski across languages, databases, frameworks, cloud platforms, DevOps tooling, and software architecture patterns.',
    },
  ],
})

// Headline skills, called out in the Core Expertise band above the full
// inventory. Scott's own wording/ordering — not derived from the
// categorized list below.
const coreSkills: string[] = [
  'Software/Solution Architecture',
  'C# / .NET',
  'SQL Server',
  'REST API Design',
  'Docker',
  'DevOps',
  'Vue.js',
  'TypeScript',
]

const categories: SkillCategory[] = [
  {
    name: 'Languages',
    skills: ['C#', 'SQL', 'TypeScript', 'JavaScript', 'PowerShell', 'Markdown', 'C++', 'C'],
  },
  {
    name: 'Databases',
    skills: ['SQL Server', 'MySQL', 'MongoDB', 'CosmosDB', 'PostgreSQL', 'Firebase', 'SQLite'],
  },
  {
    name: 'Frameworks',
    skills: ['.NET', 'Blazor', 'Vue.js', 'Node.JS', 'Bootstrap', 'Vuetify', 'CSS', 'SASS'],
  },
  {
    name: 'Tools',
    skills: ['Visual Studio', 'Git', 'VSCode', 'Docker', 'Jira', 'Postman', 'RabbitMQ', 'MassTransit', 'Nginx', 'Redis'],
  },
  {
    name: 'OS',
    skills: ['Windows', 'Linux', '*nix', 'Raspberry PI'],
  },
  {
    name: 'Security',
    skills: ['OAuth', 'JWT', 'OpenID'],
  },
  {
    name: 'Architectures',
    skills: ['Onion', 'Clean', 'Event Driven', 'Microservice', 'Modular Monolith', 'Hexagonal', 'Vertical Slice', 'Cloud Native', 'REST API Design'],
  },
  {
    name: 'Cloud Providers',
    skills: ['Azure', 'AWS', 'GCP'],
  },
  {
    name: 'DevOps',
    skills: ['Azure DevOps', 'Github', 'BitBucket', 'Octopus'],
  },
  {
    name: 'Networking',
    skills: ['Topology', 'DNS', 'Load Balancing', 'Firewalls', 'Email & SMTP', 'TCP/IP & UDP', 'Routing', 'Hardware'],
  },
]
</script>
