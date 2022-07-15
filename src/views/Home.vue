<template>
  <main class="container mx-auto px-2">
    <div class="mx-auto max-w-44">
      <img
        class="h-44"
        :src="logo"
        alt="RopeScore Logo"
      >
    </div>
    <h1 class="text-center text-4xl font-bold">
      RopeScore Judging
    </h1>

    <nav class="grid grid-cols-1 grid-rows-2">
      <router-link
        class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none focus:outline-none outline-none"
        to="/practice"
      >
        Practice
      </router-link>
      <router-link
        class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/groups"
      >
        Judge a RopeScore Competition
      </router-link>
      <router-link
        class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/device-shares"
      >
        Connect to a RopeScore Live Screen
      </router-link>
    </nav>

    <div v-if="needRefresh" class="mb-8">
      <span class="font-bold">Update required, reload to activate</span>
      <button
        class="block p-2 mt-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none focus:outline-none outline-none w-full"
        @click="updateSW()"
      >
        Reload
      </button>
    </div>

    <div class="mb-8">
      <p>Server: {{ apiDomain }}</p>
      <select-field
        v-model="localManual"
        label="Preferred Server"
        :data-list="localApis"
      />
    </div>

    <p v-if="!standalone">
      For best experience, add this web-app to your homescreen
      <!-- TODO: instructions -->
    </p>
    <p>
      &copy; Swantzter 2021-2022 &mdash;
      {{ version }} &mdash;
      <a
        class="text-indigo-700 hover:text-indigo-900"
        href="https://ropescore.com"
        target="_blank"
        rel="noopener"
      >RopeScore - the simple scoring system</a>
    </p>
  </main>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import logo from '../assets/logo.svg'
import { useSW } from '../hooks/sw'
import { apiDomain, localManual, localApis } from '../apollo'

import { SelectField } from '@ropescore/components'

const standalone = ref(false)

watchEffect(() => {
  standalone.value = window.matchMedia('(display-mode: standalone)').matches
})

const version = (import.meta.env.VITE_COMMIT_REF ?? 'dev').toString().substring(0, 7)

const { needRefresh, updateSW } = useSW()
</script>
