<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      @click="router.go(-1)"
    />
    <div
      v-if="auth.loading.value"
      class="flex justify-center items-center text-2xl"
    >
      Connecting
    </div>
    <div
      v-else
      class="flex justify-center items-center text-3xl font-bold"
    >
      {{ auth.user.value?.id }}
    </div>
    <battery-status />
  </nav>

  <div class="m-2 mt-0">
    <h1 class="text-2xl">{{ group?.name }}</h1>
  </div>

  <div class="flex flex-col gap-4 px-2 mt-2">
    <router-link
      v-for="scoresheet in remainingScoresheets"
      :key="scoresheet.id"
      :to="`/score/${scoresheet.id}`"
      class="block grid grid-cols-[3rem,auto] grid-rows-3 rounded bg-green-500 hover:bg-green-600 text-white p-2"
    >
      <span class="row-span-3 flex justify-center items-center">{{ scoresheet.heat }}</span>
      <span class="col-start-2">{{ scoresheet.participantId }}: {{ scoresheet.participantName }}</span>
      <span class="col-start-2">{{ scoresheet.rulesId }}: {{ scoresheet.competitionEventLookupCode }}</span>
      <span class="col-start-2">{{ scoresheet.judgeId }} ({{ scoresheet.judgeType }}): {{ scoresheet.judgeName }}</span>
    </router-link>
  </div>

  <div
    v-if="loading"
    class="p-2"
  >
    Loading...
  </div>

  <div
    v-if="error"
    class="p-2"
  >
    {{ error }}
  </div>

  <details class="px-2 mt-2">
    <summary class="sticky top-0">
      Completed Scoresheets ({{ completedScoresheets.length }})
    </summary>

    <div class="flex flex-col gap-4 mt-2">
      <router-link
        v-for="scoresheet in completedScoresheets"
        :key="scoresheet.id"
        :to="`/score/${scoresheet.id}`"
        class="block grid grid-cols-[3rem,auto] grid-rows-3 rounded bg-green-500 hover:bg-green-600 text-white p-2"
      >
        <span class="row-span-3 flex justify-center items-center">{{ scoresheet.heat }}</span>
        <span class="col-start-2">{{ scoresheet.participantId }}: {{ scoresheet.participantName }}</span>
        <span class="col-start-2">{{ scoresheet.rulesId }}: {{ scoresheet.competitionEventLookupCode }}</span>
        <span class="col-start-2">{{ scoresheet.judgeId }} ({{ scoresheet.judgeType }}): {{ scoresheet.judgeName }}</span>
      </router-link>
    </div>
  </details>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../hooks/auth'
import ScoreButton from '../components/ScoreButton.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import { useGroupScoresheetsQuery } from '../graphql/generated'
import { useResult } from '@vue/apollo-composable'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const { result, loading, error } = useGroupScoresheetsQuery({ groupId: route.params.id as string }, () => ({ fetchPolicy: 'cache-and-network', pollInterval: 30_000, enabled: auth.isLoggedIn.value }))

const group = useResult(result, null, res => res?.group)
const scRes = useResult(result, [], res => res?.group?.scoresheets)

const remainingScoresheets = computed(() =>
  scRes.value
    ? [...scRes.value]
        .filter(sc => !sc.completedAt)
        .sort((a, b) => a.heat === b.heat ? a.participantId.localeCompare(b.participantId) : a.heat - b.heat)
    : []
)
const completedScoresheets = computed(() =>
  scRes.value
    ? [...scRes.value]
        .filter(sc => !!sc.completedAt)
        .sort((a, b) => a.heat === b.heat ? a.participantId.localeCompare(b.participantId) : a.heat - b.heat)
    : []
)
</script>
