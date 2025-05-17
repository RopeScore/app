<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { TextField, NoteCard } from '@ropescore/components'
import { computed, ref, onMounted } from 'vue'
import ScoreButton from '../../components/ScoreButton.vue'
import { useServoAuth } from '../../hooks/servo-auth'
import { useRouter, useRoute } from 'vue-router'

const defaultServoBaseUrl = import.meta.env.VITE_DEFAULT_SERVO_BASE_URL ?? 'https://scoring.ijru.sport/'
const defaultServoCodeType = 'a'

const route = useRoute()
const accessCode = ref<string>(new URL(`${defaultServoCodeType}/`, defaultServoBaseUrl).href)

const router = useRouter()
const { assignment, prompt, loading, error, initialize, logOut } = useServoAuth()

const completeUri = computed(() => prompt.value?.uriComplete ?? '')
const qrcode = useQRCode(completeUri)

onMounted(() => {
  if (typeof route.query.code === 'string' && /^\d+(?:-\d+)$/.test(route.query.code)) {
    const baseUrl = typeof route.query['base-url'] === 'string' ? route.query['base-url'] : defaultServoBaseUrl
    const type = typeof route.query.type === 'string' && ['a', 's'].includes(route.query.type) ? route.query.type : defaultServoCodeType

    accessCode.value = new URL(`${type}/${route.query.code}`, baseUrl).href

    void initialize(accessCode.value)
  }
})
</script>

<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
      @click="router.push('/')"
    />
    <div
      v-if="assignment"
      class="flex justify-center items-center text-2xl"
    >
      {{ assignment.assignmentCode }}
    </div>
    <div v-else />
  </nav>

  <main v-if="assignment" class="px-2">
    <h1>Connected as: {{ assignment.assignmentLabel }}</h1>

    <score-button
      label="Go to entries"
      single-row
      class="w-full mx-0 h-20"
      @click="router.push(`/servo/entries`)"
    />

    <score-button
      label="Disconnect"
      color="red"
      single-row
      class="w-full mx-0 h-20"
      @click="logOut()"
    />
  </main>

  <main v-else class="px-2">
    <form @submit.prevent="initialize(accessCode)">
      <h1>Connect to IJRU Scoring</h1>
      <text-field v-model="accessCode" label="Access Code URI" type="url" :disabled="loading" />
      <score-button
        label="Connect"
        single-row
        class="w-full mx-0 h-20"
        type="submit"
        :disabled="loading"
        @click="initialize(accessCode)"
      />
    </form>
    <div v-if="loading">
      <score-button
        label="Cancel connection"
        color="red"
        single-row
        class="w-full mx-0 h-20"
        @click="logOut()"
      />
    </div>
    <note-card v-if="error" color="red">
      {{ error }}
    </note-card>
    <note-card v-if="prompt" class="text-center">
      {{ prompt.text }}
      <p class="text-2xl font-bold font-mono">
        {{ prompt.code }}
      </p>

      <div v-if="prompt.uri" class="mt-6">
        Or scan the QR code below to log in with your IJRU Account

        <img class="aspect-1/1 w-full max-w-40 mx-auto mt-2" alt="" :src="qrcode">

        <a
          :href="prompt.uriComplete ?? prompt.uri"
          class="text-indigo-700 hover:text-indigo-900"
          target="_blank"
          rel="noopener"
        >{{ prompt.uri }}</a>
      </div>
    </note-card>
  </main>
</template>
