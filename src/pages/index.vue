<template>
  <v-container class="dflex fill-height" fluid>
    <v-row>
      <v-col>
        <v-row class="d flex align-center justify-center">
          <h1 class="text-h2 text-center" style="font-weight: bold">Scott Vercuski</h1>
        </v-row>
        <v-row class="align-center justify-center">
          <h2 class="text-h4 text-center" style="font-weight: 500">Software &amp; Solution Architect</h2>
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
        <v-row class="align-center justify-center ga-4 px-4">
          <v-btn
            color="primary"
            size="large"
            to="/contact/"
          >
            Get in touch
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            href="https://www.linkedin.com/in/scott-vercuski/"
            target="_blank"
            rel="noopener"
          >
            Connect on LinkedIn
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            to="/projects/"
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
import { usePageMeta } from '../composables/usePageMeta'
import { canonicalUrl } from '../site'
import { PERSON_ID, WEBSITE_ID, person, useJsonLd, website } from '../utils/structuredData'

// Homepage: name, headline, calls to action and a random quote.

// JSON-LD (ADR-0003 / migration plan Wave 2): the WebSite, and this page
// as the ProfilePage of its owner. The Person is described in full only
// here; other pages refer to it by its @id (see utils/structuredData.ts).
useJsonLd('page', [
  website,
  {
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl('/')}#profilepage`,
    url: canonicalUrl('/'),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  },
  person,
])

usePageMeta({
  title: 'Scott Vercuski | Software Architect',
  description: "I'm a long time developer, mainly in C#/Typescript/Vue/SQL spaces, a pseudo DBA, one time DevOps/Network engineer, gamer, hobbyist, and enthusiast of many things.",
})
</script>
