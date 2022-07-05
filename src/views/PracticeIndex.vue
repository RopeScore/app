<template>
  <div>
    <nav class="grid grid-cols-3 h-header">
      <score-button
        label="Back"
        single-row
        @click="goBack()"
      />
      <score-button
        :label="showHidden ? 'Yay' : ''"
        :color="showHidden ? 'green' : 'none'"
        single-row
        @click="hiddenCount++"
      />
    </nav>
    <main class="flex flex-col mb-2">
      <template
        v-for="(model, idx) in models"
        :key="`model-${idx}`"
      >
        <model-card
          v-if="!model.hidden || showHidden"
          :model="model"
          @select="selectModel"
        />
      </template>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import models from '../models'
import ModelCard from '../components/ModelCard.vue'
import ScoreButton from '../components/ScoreButton.vue'
import { createLocalScoresheet } from '../hooks/scoresheet'

import type { Model } from '../models'
import { useSessionStorage } from '@vueuse/core'

const router = useRouter()

const hiddenCount = useSessionStorage('show-hidden', 0, { })
const showHidden = computed(() => hiddenCount.value >= 5)

async function selectModel (model: Model, options?: Record<string, any>, competitionEventId?: string) {
  const id = await createLocalScoresheet({
    judgeType: Array.isArray(model.judgeType) ? model.judgeType[0] : model.judgeType,
    rulesId: Array.isArray(model.rulesId) ? model.rulesId[0] : model.rulesId,
    competitionEventId,
    options
  })

  router.push(`/score/local/${id}`)
}

function goBack () {
  router.go(-1)
}
</script>
