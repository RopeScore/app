<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button @click="goBack()" label="Back" />
    <score-button v-if="!disableUndo" @click="addMark({ schema: 'undo', target: lastMarkSequence })" color="orange" label="Undo" />
    <score-button v-else color="none" label="" />
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
import { RootState } from '../store'
import ScoreButton from './ScoreButton.vue'

export default defineComponent({
  components: {
    ScoreButton
  },
  name: 'ScoreNavigation',
  setup () {
    const store = useStore<RootState>()
    const lastMarkSequence = computed(() => store.getters.currentScoresheet?.marks.length - 1)
    const disableUndo = computed(() => {
      const marks = store.getters.currentScoresheet?.marks ?? []
      return marks.length > 0 && marks[marks.length - 1]?.schema === 'undo'
    })

    return {
      lastMarkSequence,
      disableUndo,
      currentScoresheet: computed(() => store.getters.currentScoresheet)
    }
  },
  data: () => ({
    resetNext: null as null | number
  }),
  methods: {
    ...mapActions([
      'createLocalScoresheet',
      'openScoresheet',
      'saveCurrentScoresheet',
      'addMark'
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
      const { id, marks, completedAt, openedAt, ...rest } = this.currentScoresheet

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
