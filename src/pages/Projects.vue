<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <h1 class="text-h4 text-center" style="font-weight: bold">PROJECTS</h1>
    </v-row>
    <br/><br/>
    <v-row class="align-start justify-center">
      <v-col
        v-for="project in projects"
        :key="project.repoName"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="mb-6"
      >
        <ProjectCard :project="project" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { usePageMeta } from '../composables/usePageMeta'

import messagingIcon from '../assets/icons/messagingicon.webp'
import microserviceIcon from '../assets/icons/microservice-icon.webp'
import onionIcon from '../assets/icons/onion-architecture-icon.webp'
import dockerIcon from '../assets/icons/docker-icon.webp'
import verticalSliceIcon from '../assets/icons/vertical-slice-icon.png'
import type { Project } from '../types/project'

usePageMeta({
  title: 'Projects | Scott Vercuski',
  description: 'A selection of software architecture and backend project templates by Scott Vercuski, including Vertical Slice + Clean Architecture, Onion Architecture, Microservice Architecture, messaging, and Docker Compose scripts.',
})

/**
 * Projects shown as cards, in display order. Adding a new project card
 * going forward is just appending an entry here — ProjectCard.vue handles
 * the layout, and the grid above wraps automatically as the list grows.
 */
const projects: Project[] = [
  {
    repoName: 'Messaging.Template',
    icon: messagingIcon,
    iconAlt: 'Messaging.Template icon',
    description: 'A lightweight message-contract template for decoupling producers and consumers in event-driven systems — shared message shapes defined up front so services can evolve independently without breaking downstream consumers.',
    framework: '.NET 9',
    language: 'C#',
    githubUrl: 'https://github.com/Vercuski/MESSAGING.Template',
  },
  {
    repoName: 'MicroserviceArch.Template',
    icon: microserviceIcon,
    iconAlt: 'MicroserviceArch.Template icon',
    description: 'A starting point for service boundaries done right — independent deployability, per-service data ownership, and clean inter-service contracts, the patterns that keep a microservice architecture from becoming a distributed monolith.',
    framework: '.NET 9',
    language: 'C#',
    githubUrl: 'https://github.com/Vercuski/MICROSERVICEARCH.Template',
  },
  {
    repoName: 'OnionArch.Template',
    icon: onionIcon,
    iconAlt: 'OnionArch.Template icon',
    description: 'A dotnet new template for Onion Architecture — a dependency-free domain at the center, in-house CQRS dispatch in the application layer, and API, console and Blazor front ends at the edge. Persistence pairs EF Core and Dapper, with SQL Server, PostgreSQL or MySQL picked per read and write side in configuration.',
    framework: '.NET 10',
    language: 'C#',
    githubUrl: 'https://github.com/Vercuski/ONIONARCH.Template',
  },
  {
    repoName: 'Vertical_Slice-Clean_Architecture.Template',
    icon: verticalSliceIcon,
    iconAlt: 'Vertical_Slice-Clean_Architecture.Template icon',
    description: 'A dotnet new template for a Minimal API that organizes each use case as a self-contained vertical slice on top of Clean Architecture layers — pick EF Core or Dapper on SQL Server, PostgreSQL or MySQL, with architecture tests that keep slices from reaching into each other.',
    framework: '.NET 10',
    language: 'C#',
    githubUrl: 'https://github.com/Vercuski/Vertical_Slice-Clean_Architecture.Template',
  },
  {
    repoName: 'Docker-Scripts',
    icon: dockerIcon,
    iconAlt: 'Docker-Scripts icon',
    description: "A working library of Docker Compose configurations for common local-dev and self-hosted scenarios — the kind of infrastructure scaffolding that turns 'works on my machine' into 'works everywhere.'",
    framework: 'Various',
    language: 'Various',
    githubUrl: 'https://github.com/Vercuski/Docker-Scripts',
  },
]
</script>
