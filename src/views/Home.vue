<template>
  <main class="container mx-auto px-2">
    <div class="mx-auto max-w-44"><img class="h-44" :src="logo" alt="RopeScore Logo" /></div>
    <h1 class="text-center text-4xl font-bold">RopeScore Judging</h1>

    <nav class="grid grid-cols-1 grid-rows-2">
      <router-link class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded" to="/practice">Practice</router-link>
      <!-- <router-link class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded" to="/session">Judge a Competition</router-link> -->

      <button @click="reset" class="block p-2 my-8 text-center text-lg text-white bg-red-500 hover:bg-red-700 rounded">
        {{ resetNext ? 'Click Again' : `Remove all stored scoresheets (${numScoresheets})` }}
      </button>
    </nav>

    <p v-if="!standalone">
      For best experience, add this web-app to your homescreen
      <!-- TODO: isntructions -->
    </p>
    <p>
      &copy; Swantzter 2021 &mdash; <a class="text-indigo-700 hover:text-indigo-900" href="https://ropescore.com" target="_blank" rel="noopener">RopeScore - the simple scoring system</a>
    </p>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { mapMutations, useStore } from 'vuex'
import logo from '../assets/logo.svg'
import ScoreButton from '../components/ScoreButton.vue'
import { State } from '../store'

export default defineComponent({
  components: { ScoreButton },
  name: 'Home',
  data: () => ({
    logo,
    resetNext: null as null | number
  }),
  setup () {
    const store = useStore<State>()

    return {
      numScoresheets: computed(() => store.state.scoresheets.length)
    }
  },
  computed: {
    standalone () {
      return window.matchMedia('(display-mode: standalone)').matches
    }
  },
  methods: {
    ...mapMutations([
      'removeAllScoresheets',
      'completeOpenScoresheet'
    ]),
    async reset () {
      if (!this.resetNext) {
        this.resetNext = setTimeout(() => {
          this.resetNext = null
        }, 3000)
        return
      }

      clearTimeout(this.resetNext)

      try {
        this.completeOpenScoresheet()
      } catch {}
      this.removeAllScoresheets()

      this.resetNext = null
    },
  }
})
</script>
