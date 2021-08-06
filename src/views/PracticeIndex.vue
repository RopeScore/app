<template>
  <div>
    <nav class="grid grid-cols-3 h-header">
      <score-button
        label="Back"
        single-row
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
import models from '../models'
import ModelCard from '../components/ModelCard.vue'
import ScoreButton from '../components/ScoreButton.vue'

import type { Model } from '../models'
import { createLocalScoresheet } from '../hooks/scoresheet'

const router = useRouter()

async function selectModel (model: Model, competitionEventLookupCode?: string) {
  const id = await createLocalScoresheet({
    judgeType: Array.isArray(model.judgeType) ? model.judgeType[0] : model.judgeType,
    rulesId: Array.isArray(model.rulesId) ? model.rulesId[0] : model.rulesId,
    competitionEventLookupCode
  })

  router.push(`/score/local/${id}`)
}

function goBack () {
  router.go(-1)
}
</script>
