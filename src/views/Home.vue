<template>
  <main class="container mx-auto px-2">
    <div class="mx-auto max-w-44"><img class="h-44" :src="logo" alt="RopeScore Logo" /></div>
    <h1 class="text-center text-4xl font-bold">RopeScore Judging</h1>

    <nav class="grid grid-cols-1 grid-rows-2">
      <router-link class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none" to="/practice">Practice</router-link>
      <!-- <router-link class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded" to="/session">Judge a Competition</router-link> -->

      <button @click="reset" class="block p-2 my-8 text-center text-lg text-white bg-red-500 hover:bg-red-700 rounded tap-transparent hover:outline-none">
        {{ resetNext ? 'Click Again' : `Remove all stored scoresheets (${numScoresheets})` }}
      </button>

      <button @click="create" class="block p-2 my-8 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none">
        Create a bunch of scoresheets ({{created}})
      </button>

      {{ batteryLevel }}
    </nav>

    <p v-if="!standalone">
      For best experience, add this web-app to your homescreen
      <!-- TODO: instructions -->
    </p>
    <p>
      &copy; Swantzter 2021 &mdash;
      {{ version }} &mdash;
      <a class="text-indigo-700 hover:text-indigo-900" href="https://ropescore.com" target="_blank" rel="noopener">RopeScore - the simple scoring system</a>
    </p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapMutations } from 'vuex'
import logo from '../assets/logo.svg'
import ScoreButton from '../components/ScoreButton.vue'

export default defineComponent({
  components: { ScoreButton },
  name: 'Home',
  data: () => ({
    logo,
    resetNext: null as null | number,
    created: 0,
    numScoresheets: 0
  }),
  async mounted () {
    this.updateNumScoresheets()
  },
  computed: {
    standalone () {
      return window.matchMedia('(display-mode: standalone)').matches
    },
    version () {
      return (import.meta.env.VITE_COMMIT_REF ?? 'dev').toString().substring(0, 7)
    },
    batteryLevel (): string {
      console.log(this.$store.state)
      if (!this.$store.state.device.batteryLevel) return ''
      return Math.round(this.$store.state.device.batteryLevel * 100).toString() + '%'
    }
  },
  methods: {
    ...mapActions([
      'removeAllScoresheets',
      'createLocalScoresheet',
      'openScoresheet',
      'saveCurrentScoresheet',
      'listScoresheets'
    ]),
    ...mapMutations([
      'completeOpenScoresheet',
      'setCurrentScoresheet',
      'addMark'
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
      await this.removeAllScoresheets()
      this.updateNumScoresheets()

      this.resetNext = null
    },
    async updateNumScoresheets () {
      this.numScoresheets = (await this.listScoresheets()).length
    },
    async create () {
      console.time('create')
      this.created = 0
      for (let i = 0; i < 600; i++) {
        this.created++
        let id = await this.createLocalScoresheet({
          judgeType: 'R',
          rulesId: 'ijru@2.0.0',
          competitionEventLookupCode: 'e.ijru.fs.sr.srtf.4.75'
        })
        await this.openScoresheet(id)
        for (let j = 0; j < 100; j++) {
          this.addMark({ fieldId: 'repeatedSkill', value: j })
        }
        this.completeOpenScoresheet()
        await this.saveCurrentScoresheet()
        this.setCurrentScoresheet(null)
      }
      console.timeEnd('create')
      this.updateNumScoresheets()
    }
  }
})
</script>
