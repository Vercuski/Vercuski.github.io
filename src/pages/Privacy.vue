<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <h1 class="text-h4 text-center" style="font-weight: bold">PRIVACY</h1>
    </v-row>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h6 text-center" style="font-weight: bold">
        What this site collects, why, and who else handles it.
      </span>
    </v-row>
    <br/><br/>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="px-6 privacy">
        <p class="text-medium-emphasis">Last updated {{ LAST_UPDATED }}</p>

        <h2>The short version</h2>
        <p>This is a personal website. It doesn't have accounts, it doesn't sell or
        share your information for advertising, and the only personal details it
        collects are the ones you choose to send through the
        <router-link to="/contact/">contact form</router-link>.</p>

        <h2>Contact form</h2>
        <p>When you send a message, the form collects your <strong>full name</strong>,
        <strong>email address</strong>, and <strong>message</strong>. These are used
        only to read and reply to your message.</p>
        <p>Messages are delivered by
        <a href="https://web3forms.com/" target="_blank" rel="noopener">Web3Forms</a>,
        which passes them on to my personal email inbox. They are kept there for as
        long as they are useful to the conversation, and are not added to any
        mailing list.</p>

        <h2>Spam protection</h2>
        <p>The contact form uses
        <a href="https://www.hcaptcha.com/" target="_blank" rel="noopener">hCaptcha</a>
        to check that messages come from people rather than bots. hCaptcha loads
        only on the contact page and collects information about your browser and
        how you interact with the check. Its use is governed by the hCaptcha
        <a href="https://www.hcaptcha.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>
        and <a href="https://www.hcaptcha.com/terms" target="_blank" rel="noopener">Terms of Service</a>.</p>

        <h2>Analytics</h2>
        <p>The site uses
        <a href="https://marketingplatform.google.com/about/analytics/" target="_blank" rel="noopener">Google Analytics</a>
        to see which pages are visited and how people find the site. Google Analytics
        sets cookies and collects information such as the pages you view, your
        approximate location, and your browser and device type. I only look at this
        in aggregate. You can read how Google uses it in
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses information from sites that use its services</a>,
        and opt out with the
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics opt-out add-on</a>
        or your browser's tracking protection.</p>

        <h2>Hosting</h2>
        <p>Like any website, the server that hosts this site may record standard
        request information, such as your IP address and browser, in its logs to keep
        the site running and secure.</p>

        <h2>Your choices</h2>
        <p>If you've sent a message and would like it deleted, or have any questions
        about this page, <router-link to="/contact/">get in touch</router-link> and
        I'll take care of it.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { usePageMeta } from '../composables/usePageMeta'

const LAST_UPDATED = 'October 20, 2026'

usePageMeta({
  title: 'Privacy | Scott Vercuski',
  description: 'What scott.vercuski.com collects through its contact form, spam protection, and analytics, and how that information is used.',
})
</script>

<style scoped>
.privacy h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}

.privacy p + p {
  margin-top: 0.75rem;
}
</style>
