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
      currentScoresheet: computed(() => store.state.currentScoresheet)
    }
  },
  data: () => ({
    resetNext: null as null | number
  }),
  methods: {
    ...mapActions([
      'createLocalScoresheet',
    ]),
    ...mapMutations([
      'openScoresheet',
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

      const scoresheetId = await this.createLocalScoresheet({
        judgeType: this.currentScoresheet?.judgeType,
        rulesId: this.currentScoresheet?.rulesId
      })
      this.completeOpenScoresheet()
      this.openScoresheet(scoresheetId)

      this.resetNext = null
    },
    goBack () {
      this.$router.go(-1)
      this.completeOpenScoresheet()
    }
  }
})
</script>
