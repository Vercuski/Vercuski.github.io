<template>
  <v-container class="dflex fill-height" fluid>
    <v-row>
      <v-col>
        <v-row class="d flex align-center justify-center">
          <div class="text-h2 text-center" style="font-weight: bold">Scott Vercuski</div>
        </v-row>
        <v-row class="align-center justify-center">
          <div class="text-h4 text-center" style="font-weight: 500">Software &amp; Solution Architect</div>
        </v-row>
        <br />
        <v-row class="align-center justify-center">
          <div class="text-h5 text-center" style="max-width: 900px">
            30+ years turning ambiguous requirements into systems that scale
            &mdash; architecture, backend engineering, and DevOps across the
            full lifecycle, mostly in C#/.NET, SQL, and Vue.
          </div>
        </v-row>
        <br />
        <v-row class="align-center justify-center">
          <v-btn
            color="primary"
            size="large"
            href="https://www.linkedin.com/in/scott-vercuski/"
            target="_blank"
            rel="noopener"
            class="mx-2"
          >
            Connect on LinkedIn
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            to="/Projects"
            class="mx-2"
          >
            View my projects
          </v-btn>
        </v-row>
        <br /><br />
        <v-row class="align-center justify-center">
          <div class="text-h5 text-center">
            <quote></quote>
          </div>
        </v-row>
    </v-col>
  </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'

// Person/ProfilePage JSON-LD (ADR-0003 / migration plan Wave 2) — describes
// Scott as a Person, nested as the mainEntity of this page as a ProfilePage.
// Only added here (the homepage) rather than on every route, since this is
// the site's canonical profile page.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Scott Vercuski',
    url: 'https://scott.vercuski.com/',
    image: 'https://scott.vercuski.com/images/me.jpg',
    jobTitle: 'Software/Software Architect',
    description: "Solution/Software Architect, long time developer, mainly in C#/Typescript/Vue/SQL spaces, a pseudo DBA, one time DevOps/Network engineer.",
    sameAs: [
      'https://www.linkedin.com/in/scott-vercuski/',
      'https://github.com/Vercuski',
    ],
  },
}

useHead({
  title: 'Scott Vercuski | Software Architect',
  meta: [
    {
      name: 'description',
      content: "I'm a long time developer, mainly in C#/Typescript/Vue/SQL spaces, a pseudo DBA, one time DevOps/Network engineer, gamer, hobbyist, and enthusiast of many things.",
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(personJsonLd),
    },
  ],
})
</script>
