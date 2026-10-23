<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <h1 class="text-h4 text-center" style="font-weight: bold">CONTACT</h1>
    </v-row>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h6 text-center" style="font-weight: bold">
        Have a question, a project in mind, or just want to say hi? Send me a message.
      </span>
    </v-row>
    <br/><br/>
    <v-row justify="center">
      <v-col cols="12" md="6" class="px-6">
        <v-alert v-if="status === 'sent'" type="success" variant="tonal" class="mb-6">
          Thanks for reaching out! Your message has been sent.
        </v-alert>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
          {{ errorMessage }}
        </v-alert>

        <v-form ref="form" validate-on="blur" @submit.prevent="submit">
          <v-text-field
            v-model="fullName"
            label="Full Name"
            autocomplete="name"
            :rules="nameRules"
            :maxlength="NAME_MAX"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="email"
            label="Email Address"
            type="email"
            autocomplete="email"
            :rules="emailRules"
            :maxlength="EMAIL_MAX"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="message"
            label="Message"
            :rules="messageRules"
            :maxlength="MESSAGE_MAX"
            :counter="MESSAGE_MAX"
            rows="8"
            auto-grow
            variant="outlined"
            class="mb-2"
          />

          <!-- Honeypot: hidden from people, but naive bots fill it in, and
               Web3Forms drops any submission where it is set. -->
          <input
            v-model="botcheck"
            type="checkbox"
            name="botcheck"
            class="d-none"
            tabindex="-1"
            autocomplete="off"
          />

          <div ref="captchaEl" class="mb-2" />
          <p v-if="captchaError" class="text-error text-caption mb-4">{{ captchaError }}</p>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="status === 'sending'"
            :disabled="status === 'sending'"
          >
            Send Message
          </v-btn>
          <p class="text-caption text-medium-emphasis mt-4">
            Your details are only used to reply to your message. See the
            <router-link to="/privacy/">privacy policy</router-link> for how they're
            handled. This form is protected by hCaptcha, and its
            <a href="https://www.hcaptcha.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>
            and <a href="https://www.hcaptcha.com/terms" target="_blank" rel="noopener">Terms of Service</a>
            apply.
          </p>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { usePageMeta } from '../composables/usePageMeta'
import { CONTACT_FORM } from '../site'

// Contact form: validates the fields, requires an hCaptcha check, and
// emails the message through Web3Forms (see CONTACT_FORM in site.ts).

usePageMeta({
  title: 'Contact | Scott Vercuski',
  description: 'Send Scott Vercuski a message about development, a project, hobbies and interests, or just to say hi.',
})

const NAME_MAX = 100
const EMAIL_MAX = 254
const MESSAGE_MAX = 2000

// hCaptcha sitekey Web3Forms verifies against when the form is built by
// hand rather than with their client script.
const HCAPTCHA_SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'

/** A Vuetify validation rule: `true` when valid, else the error to show. */
type Rule = (value: string) => true | string

/**
 * @param label - Field name used in the error message.
 * @returns A rule that fails on an empty or whitespace-only value.
 */
const required = (label: string): Rule => value => !!value?.trim() || `${label} is required`

// Stricter than the browser's type="email" check, which accepts addresses
// such as 'a@b' with no top-level domain: a dot-atom local part, a domain
// of letter/digit/hyphen labels, and an alphabetic TLD of two or more
// characters, within the RFC 5321 length limits.
const EMAIL_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

/**
 * @param value - A trimmed email address.
 * @returns Whether it matches {@link EMAIL_PATTERN} within the length limits.
 */
function isValidEmail (value: string): boolean {
  const [local] = value.split('@')
  return value.length <= EMAIL_MAX && local.length <= 64 && EMAIL_PATTERN.test(value)
}

const nameRules: Rule[] = [
  required('Full Name'),
  value => value.trim().length <= NAME_MAX || `Full Name must be ${NAME_MAX} characters or fewer`,
]
const emailRules: Rule[] = [
  required('Email Address'),
  value => isValidEmail(value.trim()) || 'Enter a valid email address',
]
const messageRules: Rule[] = [
  required('Message'),
  value => value.length <= MESSAGE_MAX || `Message must be ${MESSAGE_MAX.toLocaleString()} characters or fewer`,
]

const form = ref<{ validate:() => Promise<{ valid: boolean }>, reset:() => void } | null>(null)
const fullName = ref('')
const email = ref('')
const message = ref('')
const botcheck = ref(false)

const status = ref<'idle' | 'sending' | 'sent'>('idle')
const errorMessage = ref('')

// hCaptcha is loaded in the browser only: the page is also prerendered in
// Node by vite-ssg, where there is no window to load it into.
/** The parts of hCaptcha's global API this page uses. */
interface HCaptcha {
  /** Draws a widget in `el` and returns its id. */
  render (el: HTMLElement, options: Record<string, unknown>): string
  /** Clears a widget's response so it must be completed again. */
  reset (id?: string): void
}
declare global {
  interface Window {
    hcaptcha?: HCaptcha
    onContactCaptchaLoad?: () => void
  }
}

const captchaEl = ref<HTMLElement | null>(null)
const captchaToken = ref('')
const captchaError = ref('')
let captchaId: string | undefined

/**
 * Draws the hCaptcha widget and keeps {@link captchaToken} in step with
 * it. Called once hCaptcha's script has loaded.
 */
function renderCaptcha () {
  if (!window.hcaptcha || !captchaEl.value) return
  captchaId = window.hcaptcha.render(captchaEl.value, {
    sitekey: HCAPTCHA_SITEKEY,
    callback: (token: string) => { captchaToken.value = token; captchaError.value = '' },
    'expired-callback': () => { captchaToken.value = '' },
    'error-callback': () => { captchaToken.value = '' },
  })
}

onMounted(() => {
  if (window.hcaptcha) {
    renderCaptcha()
    return
  }
  window.onContactCaptchaLoad = renderCaptcha
  if (!document.getElementById('hcaptcha-script')) {
    const script = document.createElement('script')
    script.id = 'hcaptcha-script'
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=onContactCaptchaLoad'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }
})

/** Clears the captcha so the next submission needs a fresh check. */
function resetCaptcha () {
  captchaToken.value = ''
  window.hcaptcha?.reset(captchaId)
}

/**
 * Validates the form and captcha, then sends the message to Web3Forms.
 * Shows a success or error alert, clears the form on success, and resets
 * the captcha either way (each token can only be used once).
 */
async function submit () {
  errorMessage.value = ''
  status.value = 'idle'

  const { valid } = await form.value!.validate()
  captchaError.value = captchaToken.value ? '' : 'Please confirm you are human'
  if (!valid || captchaError.value) return

  status.value = 'sending'
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CONTACT_FORM.accessKey,
        subject: `Website contact from ${fullName.value.trim()}`,
        from_name: 'scott.vercuski.com',
        replyto: CONTACT_FORM.replyTo,
        name: fullName.value.trim(),
        email: email.value.trim(),
        message: message.value,
        botcheck: botcheck.value,
        'h-captcha-response': captchaToken.value,
      }),
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'The message could not be sent')
    }
    status.value = 'sent'
    form.value!.reset()
  } catch {
    status.value = 'idle'
    errorMessage.value = 'Sorry, your message could not be sent. Please try again in a moment.'
  } finally {
    resetCaptcha()
  }
}
</script>
