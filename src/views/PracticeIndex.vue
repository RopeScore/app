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
      <score-button
        :label="loading ? 'Loading' : (isSharing ? 'Will Stream' : '')"
        color="none"
        single-row
      />
    </nav>
    <main class="flex flex-col mb-2">
      <p v-if="apiDomain && isSharing" class="text-gray-600 px-2">
        {{ apiDomain }}
      </p>
      <p v-else class="text-white">
        -
      </p>
      <checkbox-field
        v-model="showHistoric"
        label="Show historic rules"
      />
      <template
        v-for="(model, idx) in models"
        :key="`model-${idx}`"
      >
        <model-card
          v-if="(!model.hidden || showHidden) && (!model.historic || showHistoric)"
          :model="model"
          :loading="loading"
          @select="selectModel"
        />
      </template>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiDomain } from '../apollo'
import models from '../models'
import ModelCard from '../components/ModelCard.vue'
import ScoreButton from '../components/ScoreButton.vue'
import { createLocalScoresheet } from '../hooks/scoresheet'

import type { Model } from '../models'
import { useSessionStorage } from '@vueuse/core'
import { DeviceStreamShareStatus, useDeviceStreamSharesQuery } from '../graphql/generated'
import { useAuth } from '../hooks/auth'
import { CheckboxField } from '@ropescore/components'

const auth = useAuth()
const router = useRouter()

const hiddenCount = useSessionStorage('show-hidden', 0, { })
const showHidden = computed(() => hiddenCount.value >= 5)
const showHistoric = ref(false)

async function selectModel (model: Model, options?: Record<string, any>, competitionEventId?: string) {
  const id = await createLocalScoresheet({
    judgeType: Array.isArray(model.judgeType) ? model.judgeType[0] : model.judgeType,
    rulesId: Array.isArray(model.rulesId) ? model.rulesId[0] : model.rulesId,
    competitionEventId,
    options: {
      ...(options ?? {}),
      deviceStream: isSharing.value
    }
  })

  await router.push(`/score/local/${id}`)
}

const { result, loading } = useDeviceStreamSharesQuery({
  fetchPolicy: 'cache-and-network',
  pollInterval: 30_000,
  enabled: auth.isLoggedIn as unknown as boolean
})

const shares = computed(() => result.value?.me?.__typename === 'Device' ? result.value.me.streamShares : [])
const isSharing = computed(() => shares.value.filter(sh => sh.status === DeviceStreamShareStatus.Accepted).length > 0)

function goBack () {
  router.go(-1)
}
</script>
