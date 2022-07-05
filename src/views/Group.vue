<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
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
    <h1 class="text-2xl">
      {{ group?.name }}
    </h1>
  </div>

  <div v-if="group" class="flex flex-col gap-4 px-2 mt-2">
    <scoresheet-link
      v-for="entry in remainingEntries"
      :key="entry.id"
      :entry="entry"
      :scoresheet="entry.deviceScoresheet"
      :group-id="group.id"
    />
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

  <details class="px-2 mt-2 mb-2">
    <summary class="sticky top-0 w-full bg-white py-4 cursor-pointer">
      Completed Scoresheets ({{ completedEntries.length }})
    </summary>

    <div v-if="group" class="flex flex-col gap-4 mt-2">
      <scoresheet-link
        v-for="entry in completedEntries"
        :key="entry.id"
        :entry="entry"
        :scoresheet="entry.deviceScoresheet"
        :group-id="group.id"
        :color="entry.didNotSkipAt ? 'gray' : 'indigo'"
      />
    </div>
  </details>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../hooks/auth'
import { isRemoteMarkScoresheet } from '../hooks/scoresheet'
import ScoreButton from '../components/ScoreButton.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import ScoresheetLink from '../components/ScoresheetLink.vue'
import { useGroupScoresheetsQuery } from '../graphql/generated'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const { result, loading, error } = useGroupScoresheetsQuery({ groupId: route.params.id as string }, () => ({ fetchPolicy: 'cache-and-network', pollInterval: 30_000, enabled: auth.isLoggedIn.value }))

const group = computed(() => result.value?.group)
const enRes = computed(() => result.value?.group?.entries ?? [])

const remainingEntries = computed(() =>
  enRes.value
    ? [...enRes.value]
        .filter(en => isRemoteMarkScoresheet(en.deviceScoresheet) && !en.deviceScoresheet?.completedAt && !en.didNotSkipAt)
        .sort((a, b) => a.heat === b.heat ? a.participant.id.localeCompare(b.participant.id) : (a.heat ?? Infinity) - (b.heat ?? Infinity))
    : []
)
const completedEntries = computed(() =>
  enRes.value
    ? [...enRes.value]
        .filter(en => !isRemoteMarkScoresheet(en.deviceScoresheet) || !!en.deviceScoresheet?.completedAt || !!en.didNotSkipAt)
        .sort((a, b) => a.heat === b.heat ? b.participant.id.localeCompare(a.participant.id) : (b.heat ?? Infinity) - (a.heat ?? Infinity))
    : []
)
</script>
