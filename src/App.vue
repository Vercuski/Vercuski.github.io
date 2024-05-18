<template>
  <v-app id="app">
    <div app class="d-flex align-center justify-end header">
      <router-link to="/" class="headerrouterlink my-5 mx-5">HOME</router-link>
      <router-link to="/About" class="headerrouterlink my-5 mx-5"
        >ABOUT</router-link
      >
      <router-link to="/Projects" class="headerrouterlink my-5 mx-5"
        >PROJECTS</router-link
      >
      <router-link to="/Skills" class="headerrouterlink my-5 mx-5"
        >SKILLS</router-link
      >
    </div>
    <v-main class="main">
      <router-view />
    </v-main>
    <v-footer app class="d-flex align-center justify-center footer">
      <span class="text-body-1">&copy; 2024. Created by Scott Vercuski</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
//
</script>
