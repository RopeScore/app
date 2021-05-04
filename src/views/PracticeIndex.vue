<template>
  <div>
    <nav class="grid grid-cols-3 h-header">
      <score-button @click="goBack()" label="Back"/>
    </nav>
    <main class="flex flex-col mb-2">
      <model-card
        v-for="(model, idx) in models"
        :key="`model-${idx}`"
        :model="model"
        @select="selectModel"
      />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import ModelCard from '../components/ModelCard.vue'
import ScoreButton from '../components/ScoreButton.vue'
import models, { Model } from '../models'

export default defineComponent({
  components: { ScoreButton, ModelCard },
  name: 'PracticeIndex',
  setup() {
    return {
      models
    }
  },
  methods: {
    ...mapActions([
      'createLocalScoresheet',
      'openScoresheet'
    ]),
    rulesetList (rulesId: string | string[]) {
      return Array.isArray(rulesId) ? rulesId.join(', ') : rulesId
    },
    async selectModel (model: Model, competitionEventLookupCode?: string) {
      const scoresheetId = await this.createLocalScoresheet({
        judgeType: model.judgeType,
        rulesId: Array.isArray(model.rulesId) ? model.rulesId[0] : model.rulesId,
        competitionEventLookupCode
      })

      this.$router.push(`/score/${scoresheetId}`)
    },
    goBack () {
      this.$router.go(-1)
    }
  }
})
</script>
