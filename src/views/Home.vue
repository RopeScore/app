<template>
  <main v-if="isLyra" class="container mx-auto px-2">
    <h1 class="text-center text-4xl font-bold mt-25">
      Lyra Judging
    </h1>

    <note-card>
      Lyra Sports together with IJRU are bringing you a completely new judging
      experience, both during practice and in competition on Android and iOS.
      <span class="font-bold">
        This app will soon get updated with a completely new and
        different design,
      </span>
      but to allow you to get started we've put out this practice app to help
      you learn the new rules. Don't worry, the buttons on the judging screens
      will stay in the same place.
    </note-card>

    <nav class="grid grid-cols-1 grid-rows-2 gap-8 mt-8">
      <router-link
        class="block p-2 text-center text-lg text-white bg-purple-500 hover:bg-purple-600 rounded hover:outline-none focus:outline-none outline-none"
        to="/practice"
      >
        Practice
      </router-link>
      <router-link
        class="block p-2 text-center text-lg text-white bg-purple-500 hover:bg-purple-600 rounded"
        to="/scoresheets"
      >
        Stored Scoresheets
      </router-link>
    </nav>

    <p>
      &copy; Swantzter 2019-2024, Lyra Sports Inc. 2024 &mdash;
      {{ version }}
    </p>
  </main>

  <main v-else class="container mx-auto px-2">
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

    <nav class="grid grid-cols-1 grid-rows-2 gap-8 mt-8">
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none focus:outline-none outline-none"
        to="/practice"
      >
        Practice
      </router-link>
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/servo/connect"
      >
        Judge an IJRU Scoring Competition
      </router-link>
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/rs/groups"
      >
        Judge a RopeScore Competition
      </router-link>
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/rs/device-shares"
      >
        Connect to a RopeScore Live Screen
      </router-link>
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/scoresheets"
      >
        Stored Scoresheets
      </router-link>
    </nav>

    <div class="mb-8">
      <p>Server: {{ apiDomain }}</p>
      <select-field
        v-model="localManual"
        label="Preferred Server"
        :data-list="localApis"
      />
    </div>

    <note-card v-if="!standalone">
      For best experience, add this web-app to your homescreen.<br>
      <span class="font-semibold">On Android</span>, open the menu in your
      browser (usually three dots next to the search bar) and select an option
      saying something like "Add to homescreen" or "Install".<br>
      <span class="font-semibold">On iOS</span>, tap the "share" button and
      select "Add to Home Screen".<br>
    </note-card>

    <p>
      &copy; Swantzter 2019-2024 &mdash;
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
import { computed, ref, watchEffect } from 'vue'
import logo from '../assets/logo.svg'
import { apiDomain, localManual, localApis } from '../apollo'
import { version } from '../helpers'

import { SelectField, NoteCard } from '@ropescore/components'
import { useRoute } from 'vue-router'

const standalone = ref(false)

watchEffect(() => {
  standalone.value = window.matchMedia('(display-mode: standalone)').matches
})

const route = useRoute()
const isLyra = computed(() => 'lyra' in route.query)
</script>
