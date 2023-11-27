<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="icon-bar">
    <a href="https://www.facebook.com/svercuski" target="blank" class="iconsize facebook"
      ><img src="./assets/social/color/facebook.png" class="icon32"
    /></a>
    <a href="https://github.com/Vercuski" target="_blank" class="iconsize github"
      ><img src="./assets/social/color/github.png" class="icon32"
    /></a>
    <a href="https://www.instagram.com/scott.vercuski/" target="_blank" class="iconsize instagram"
      ><img src="./assets/social/color/instagram.png" class="icon32"
    /></a>
    <a href="https://www.linkedin.com/in/scott-vercuski/" target="_blank" class="iconsize linkedin"
      ><img src="./assets/social/color/linkedin.png" class="icon32"
    /></a>
    <a href="https://bsky.app/profile/vercuski.bsky.social" target="_blank" class="iconsize blusky"
      ><img src="./assets/social/color/bluesky.png" class="icon32"
    /></a>
    <a href="https://www.youtube.com/@ScottVercuski" target="_blank" class="iconsize youtube"
      ><img src="./assets/social/color/youtube.png" class="icon32"
    /></a>
  </div>
  <div class="flex-container">
    <div class="header"></div>
    <RouterView />
    <div class="footer">
      © 2023 - Scott Vercuski - Licensing under the
      <a
        class="footerlink"
        href="https://github.com/Vercuski/Vercuski.github.io/blob/main/LICENSE.md"
        target="_blank"
        >MIT License</a
      >
    </div>
  </div>
</template>
