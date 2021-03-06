<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button @click="goBack()" label="Back" />
    <score-button color="none" label="" />
    <score-button
      color="red"
      :label="resetNext ? 'Click Again' : 'Reset'"
      :vibration="resetNext ? 1000 : 500"
      @click="reset()"
    />
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { mapActions, mapMutations, useStore } from 'vuex'
import { State } from '../store'
import ScoreButton from './ScoreButton.vue'

export default defineComponent({
  components: {
    ScoreButton,

  },
  name: 'ScoreNavigation',
  computed: {
    isLocal () {
      return true
    }
  },
  setup () {
    const store = useStore<State>()

    return {
      currentScoresheet: computed(() => store.state.scoresheet.currentScoresheet)
    }
  },
  data: () => ({
    resetNext: null as null | number
  }),
  methods: {
    ...mapActions([
      'createLocalScoresheet',
      'openScoresheet',
      'saveCurrentScoresheet'
    ]),
    ...mapMutations([
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

      if (!this.currentScoresheet) return
      const { id, marks, ...rest } = this.currentScoresheet

      const scoresheetId = await this.createLocalScoresheet(rest)
      this.completeOpenScoresheet()
      await this.saveCurrentScoresheet()
      this.$router.replace(`/score/${scoresheetId}`)

      this.resetNext = null
    },
    goBack () {
      this.$router.go(-1)
      this.completeOpenScoresheet()
    }
  }
})
</script>
