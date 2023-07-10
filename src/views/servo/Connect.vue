<script setup lang="ts">
import { TextField, NoteCard } from '@ropescore/components'
import { ref } from 'vue'
import ScoreButton from '../../components/ScoreButton.vue'
import { useServoAuth } from '../../hooks/servo-auth'
import { useRouter } from 'vue-router'

const accessCode = ref<string>('https://scoring.ijru.sport/a/')

const router = useRouter()
const { assignment, prompt, loading, error, initialize, logOut } = useServoAuth()
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
    <note-card v-if="prompt">
      {{ prompt.text }}
      <p class="text-center text-2xl font-bold font-mono">
        {{ prompt.code }}
      </p>
    </note-card>
  </main>
</template>
