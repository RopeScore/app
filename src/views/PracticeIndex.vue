<template>
  <div>
    <nav class="grid grid-cols-3 h-header">
      <score-button
        label="Back"
        @click="goBack()"
      />
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

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import models from '../models'
import ModelCard from '../components/ModelCard.vue'
import ScoreButton from '../components/ScoreButton.vue'

import type { Model } from '../models'

const store = useStore()
const router = useRouter()

function rulesetList (rulesId: string | string[]) {
  return Array.isArray(rulesId) ? rulesId.join(', ') : rulesId
}

async function selectModel (model: Model, competitionEventLookupCode?: string) {
  const scoresheetId = await store.dispatch('createLocalScoresheet', {
    judgeType: model.judgeType,
    rulesId: Array.isArray(model.rulesId) ? model.rulesId[0] : model.rulesId,
    competitionEventLookupCode
  })

  router.push(`/score/${scoresheetId}`)
}

function goBack () {
  router.go(-1)
}
</script>
