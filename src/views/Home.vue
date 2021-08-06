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
        Judge a Competition
      </router-link>

      <!-- <button
        class="block p-2 my-8 text-center text-lg text-white bg-red-500 hover:bg-red-700 rounded tap-transparent hover:outline-none focus:outline-none outline-none"
        @click="reset"
      >
        {{ resetNext ? 'Click Again' : `Remove all stored scoresheets (${numScoresheets})` }}
      </button> -->
    </nav>

    <p v-if="!standalone">
      For best experience, add this web-app to your homescreen
      <!-- TODO: instructions -->
    </p>
    <p>
      &copy; Swantzter 2021 &mdash;
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
import { onMounted, ref, watchEffect, onUnmounted } from 'vue'
import logo from '../assets/logo.svg'

const resetNext = ref < null | number >(null)
const numScoresheets = ref(0)
const standalone = ref(false)

watchEffect(() => {
  standalone.value = window.matchMedia('(display-mode: standalone)').matches
})

const version = (import.meta.env.VITE_COMMIT_REF ?? 'dev').toString().substring(0, 7)

// async function reset () {
//   if (!resetNext.value) {
//     resetNext.value = window.setTimeout(() => {
//       resetNext.value = null
//     }, 3000)
//     return
//   }
//   clearTimeout(resetNext.value)

//   try {
//     store.commit('completeOpenScoresheet')
//   } catch {}

//   await store.dispatch('removeAllScoresheets')
//   updateNumScoresheets()
//   resetNext.value = null
// }

// async function updateNumScoresheets () {
//   numScoresheets.value = (await store.dispatch('listScoresheets')).length
// }
</script>
