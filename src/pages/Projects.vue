<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h4 text-center" style="font-weight: bold">PROJECTS</span>
    </v-row>
    <v-row class="align-center justify-center">
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
        <v-card class="my-12 mx-auto" style="max-width: 420px; border: 1px solid black">
          <v-card-item class="p-4" style="background-color: white; color:black">
            <v-row>
              <v-col cols="4">
                <a href="https://github.com/Vercuski/MESSAGING.Template" target="_blank"><img src="../assets/icons/messagingicon.webp" Style="width: 100px; height: 100px; border-radius: 50%;" /></a>
              </v-col> 
              <v-col>
                  <div class="d flex text-overline">Repository Name</div>
                  <div class="text-body-1 font-weight-bold">Messaging.Template</div>
                  <div class="d flex mt-2 my-0 text-overline">Location</div>
                  <div class="text-body-1 font-weight-bold">GitHub</div>
              </v-col>
            </v-row>
          </v-card-item>
          <v-card-item class="pa-8" style="background-color: #6966db;">
              <p class="text-h6 rz-color-on-primary-light"><strong>Description</strong></p>
              <p class="text-body-1 rz-color-on-primary-light">A lightweight message-contract template for decoupling producers and consumers in event-driven systems &mdash; shared message shapes defined up front so services can evolve independently without breaking downstream consumers.</p>
              <br />
              <v-row Gap="0">
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Framework</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>.NET 9</b></p>
                  </v-col>
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Language</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>C#</b></p>
                  </v-col>
              </v-row>
          </v-card-item>
          <v-card-item class="d flex" style="background-color: white; color:black; justify-content: end;">
              <a href="https://github.com/Vercuski/MESSAGING.Template" target="_blank"><img src="../assets/icons/github-mark.png" Style="width: 32px; height: 32px;" /></a>
          </v-card-item>
        </v-card>
      </v-col>
      <!-- Card Definition End -->
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
        <v-card class="my-12 mx-auto" style="max-width: 420px; border: 1px solid black">
          <v-card-item class="p-4" style="background-color: white; color:black">
            <v-row>
              <v-col cols="4">
                <a href="https://github.com/Vercuski/MICROSERVICEARCH.Template" target="_blank"><img src="../assets/icons/microservice-icon.webp" Style="width: 100px; height: 100px; border-radius: 30%;" /></a>
              </v-col> 
              <v-col>
                  <div class="d flex text-overline">Repository Name</div>
                  <div class="text-body-1 font-weight-bold">MicroserviceArch.Template</div>
                  <div class="d flex mt-2 my-0 text-overline">Location</div>
                  <div class="text-body-1 font-weight-bold">GitHub</div>
              </v-col>
            </v-row>
          </v-card-item>
          <v-card-item class="pa-8" style="background-color: #6966db;">
              <p class="text-h6 rz-color-on-primary-light"><strong>Description</strong></p>
              <p class="text-body-1 rz-color-on-primary-light">A starting point for service boundaries done right &mdash; independent deployability, per-service data ownership, and clean inter-service contracts, the patterns that keep a microservice architecture from becoming a distributed monolith.</p>
              <br />
              <v-row Gap="0">
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Framework</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>.NET 9</b></p>
                  </v-col>
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Language</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>C#</b></p>
                  </v-col>
              </v-row>
          </v-card-item>
          <v-card-item class="d flex" style="background-color: white; color:black; justify-content: end;">
              <a href="https://github.com/Vercuski/MICROSERVICEARCH.Template" target="_blank"><img src="../assets/icons/github-mark.png" Style="width: 32px; height: 32px;" /></a>
          </v-card-item>
        </v-card>
      </v-col>
      <!-- Card Definition End -->
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
        <v-card class="my-12 mx-auto" style="max-width: 420px; border: 1px solid black">
          <v-card-item class="p-4" style="background-color: white; color:black">
            <v-row>
              <v-col cols="4">
                <a href="https://github.com/Vercuski/ONIONARCH.Template" target="_blank"><img src="../assets/icons/onion-architecture-icon.webp" Style="width: 100px; height: 100px; border-radius: 50%;" /></a>
              </v-col> 
              <v-col>
                  <div class="d flex text-overline">Repository Name</div>
                  <div class="text-body-1 font-weight-bold">OnionArch.Template</div>
                  <div class="d flex mt-2 my-0 text-overline">Location</div>
                  <div class="text-body-1 font-weight-bold">GitHub</div>
              </v-col>
            </v-row>
          </v-card-item>
          <v-card-item class="pa-8" style="background-color: #6966db;">
              <p class="text-h6 rz-color-on-primary-light"><strong>Description</strong></p>
              <p class="text-body-1 rz-color-on-primary-light">A reference implementation of Onion Architecture &mdash; domain logic at the center, infrastructure and frameworks kept at the edges, so business rules stay testable and technology choices stay swappable.</p>
              <br />
              <v-row Gap="0">
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Framework</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>.NET 9</b></p>
                  </v-col>
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Language</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>C#</b></p>
                  </v-col>
              </v-row>
          </v-card-item>
          <v-card-item class="d flex" style="background-color: white; color:black; justify-content: end;">
              <a href="https://github.com/Vercuski/ONIONARCH.Template" target="_blank"><img src="../assets/icons/github-mark.png" Style="width: 32px; height: 32px;" /></a>
          </v-card-item>
        </v-card>
      </v-col>
      <!-- Card Definition End -->
    </v-row>
    <v-row class="align-center justify-center">
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
        <v-card class="my-12 mx-auto" style="max-width: 420px; border: 1px solid black">
          <v-card-item class="p-4" style="background-color: white; color:black">
            <v-row>
              <v-col cols="4">
                <a href="https://github.com/Vercuski/Docker-Scripts" target="_blank"><img src="../assets/icons/docker-icon.webp" Style="width: 100px; height: 100px; border-radius: 50%;" /></a>
              </v-col> 
              <v-col>
                  <div class="d flex text-overline">Repository Name</div>
                  <div class="text-body-1 font-weight-bold">Docker-Scripts</div>
                  <div class="d flex mt-2 my-0 text-overline">Location</div>
                  <div class="text-body-1 font-weight-bold">GitHub</div>
              </v-col>
            </v-row>
          </v-card-item>
          <v-card-item class="pa-8" style="background-color: #6966db;">
              <p class="text-h6 rz-color-on-primary-light"><strong>Description</strong></p>
              <p class="text-body-1 rz-color-on-primary-light">A working library of Docker Compose configurations for common local-dev and self-hosted scenarios &mdash; the kind of infrastructure scaffolding that turns 'works on my machine' into 'works everywhere.'</p>
              <br />
              <v-row Gap="0">
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Framework</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>Various</b></p>
                  </v-col>
                  <v-col cols="6">
                      <p class="text-overline rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Language</p>
                      <p class="text-body-1 rz-color-on-primary-light"><b>Various</b></p>
                  </v-col>
              </v-row>
          </v-card-item>
          <v-card-item class="d flex" style="background-color: white; color:black; justify-content: end;">
              <a href="https://github.com/Vercuski/Docker-Scripts" target="_blank"><img src="../assets/icons/github-mark.png" Style="width: 32px; height: 32px;" /></a>
          </v-card-item>
        </v-card>
      </v-col>
      <!-- Card Definition End -->
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
      </v-col>
      <!-- Card Definition End -->
      <!-- Card Definition Start -->
      <v-col align-self="center" cols="4">
      </v-col>
      <!-- Card Definition End -->
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Projects | Scott Vercuski',
  meta: [
    {
      name: 'description',
      content: 'A selection of software architecture and backend project templates by Scott Vercuski, including Onion Architecture, Microservice Architecture, messaging, and Docker Compose scripts.',
    },
  ],
})
</script>