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
    <entry-link
      v-for="entry in remainingEntries"
      :key="entry.id"
      :entry="entry"
      :scoresheets="entry.scoresheets"
      :judge="judge!"
      :assignments="judge?.assignments!"
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
      Completed Entries ({{ completedEntries.length }})
    </summary>

    <div v-if="group" class="flex flex-col gap-4 mt-2">
      <entry-link
        v-for="entry in completedEntries"
        :key="entry.id"
        :entry="entry"
        :scoresheets="entry.scoresheets"
        :judge="judge!"
        :assignments="judge?.assignments!"
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
import ScoreButton from '../components/ScoreButton.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import EntryLink from '../components/EntryLink.vue'
import { MarkScoresheetFragment, useGroupScoresheetsQuery } from '../graphql/generated'
import { isRemoteMarkScoresheet } from '../hooks/scoresheet'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const { result, loading, error } = useGroupScoresheetsQuery({ groupId: route.params.id as string }, () => ({ fetchPolicy: 'cache-and-network', pollInterval: 30_000, enabled: auth.isLoggedIn.value }))

const group = computed(() => result.value?.group)
const judge = computed(() => group.value?.deviceJudge)
const enRes = computed(() => result.value?.group?.entries ?? [])
const currentHeat = computed(() => group.value?.currentHeat ?? 1)

const remainingEntries = computed(() =>
  enRes.value
    ? [...enRes.value]
        .filter(en =>
          !en.didNotSkipAt &&
          !en.lockedAt &&
          typeof en.heat === 'number' &&
          en.heat >= currentHeat.value &&
          en.scoresheets.filter(scsh => isRemoteMarkScoresheet(scsh)).every(scsh => !(scsh as MarkScoresheetFragment).completedAt)
        )
        .sort((a, b) => {
          if (a.heat !== b.heat) return (a.heat ?? Infinity) - (b.heat ?? Infinity)
          else if (a.pool !== b.pool) return (a.pool ?? Infinity) - (b.pool ?? Infinity)
          else return a.participant.id.localeCompare(b.participant.id)
        })
    : []
)
const completedEntries = computed(() =>
  enRes.value
    ? [...enRes.value]
        .filter(en =>
          remainingEntries.value.findIndex(rem => rem.id === en.id) === -1 &&
          typeof en.heat === 'number'
        )
        .sort((a, b) => {
          if (a.heat !== b.heat) return (b.heat ?? Infinity) - (a.heat ?? Infinity)
          else if (a.pool !== b.pool) return (b.pool ?? Infinity) - (a.pool ?? Infinity)
          else return b.participant.id.localeCompare(a.participant.id)
        })
    : []
)
</script>
