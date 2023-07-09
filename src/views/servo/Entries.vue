<script setup lang="ts">
import { useRouter } from 'vue-router'
import ScoreButton from '../../components/ScoreButton.vue'
import ServoEntryLink from '../../components/ServoEntryLink.vue'
import BatteryStatus from '../../components/BatteryStatus.vue'
import { useFetch } from '@vueuse/core'
import { useServoAuth } from '../../hooks/servo-auth'
import { computed } from 'vue'
import { type AssignmentCodeLookupResponse } from '../../hooks/scoresheet'
import { version } from '../../helpers'

const router = useRouter()
const { token, baseUrl, assignment } = useServoAuth()
const url = computed(() => {
  const u = new URL(`/api/v1/lookup/assignmentcode/${assignment.value?.assignmentCode ?? ''}`, baseUrl.value)
  u.searchParams.append('app', 'ropescore.app')
  u.searchParams.append('ver', version)

  return u.href
})

const { data, error, isFetching, execute: refetch } = useFetch(url, {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
}, {
  beforeFetch ({ url, options, cancel }) {
    if (token.value == null || assignment.value?.assignmentCode == null) {
      cancel()
      return
    }

    options.headers = {
      ...options.headers,
      authorization: `Bearer ${token.value}`
    }

    return { options }
  }
}).json<AssignmentCodeLookupResponse>()

const currentHeat = computed(() => data.value?.Session.CurrentHeatNumber ?? 1)

const remainingEntries = computed(() =>
  data.value
    ? [...data.value.Entries]
        .filter(en =>
          !en.IsScratched &&
          !en.IsLocked &&
          (
            typeof en.HeatNumber !== 'number' ||
            en.HeatNumber >= currentHeat.value
          ) &&
          !en.IsJudgeScored
        )
        .sort((a, b) => {
          if (a.HeatNumber !== b.HeatNumber) return (a.HeatNumber ?? Infinity) - (b.HeatNumber ?? Infinity)
          else return a.Participants[0].FirstName.localeCompare(b.Participants[0].FirstName)
        })
    : []
)
const completedEntries = computed(() =>
  data.value
    ? [...data.value.Entries]
        .filter(en =>
          remainingEntries.value.findIndex(rem => rem.CompEventEntryID === en.CompEventEntryID) === -1
        )
        .sort((a, b) => {
          if (a.HeatNumber !== b.HeatNumber) return (b.HeatNumber ?? Infinity) - (a.HeatNumber ?? Infinity)
          else return b.Participants[0].FirstName.localeCompare(a.Participants[0].FirstName)
        })
    : []
)
</script>

<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
      @click="router.go(-1)"
    />
    <div
      v-if="assignment"
      class="flex justify-center items-center text-2xl"
    >
      {{ assignment.assignmentCode }}
    </div>
    <div v-else />
    <battery-status no-push />
  </nav>

  <div class="m-2 mt-0">
    <h1 class="text-2xl">
      {{ data?.Competition.CompetitionName ?? ' ' }}
    </h1>
    <p>
      {{ data?.StationName ?? '' }} - {{ data?.Session.SessionName ?? '' }}
    </p>
    <p class="text-gray-600">
      {{ baseUrl ?? '' }}
    </p>
  </div>

  <div v-if="data" class="flex flex-col gap-4 px-2 mt-2">
    <score-button
      label="Refresh"
      single-row
      class="mx-0 py-4"
      color="orange"
      @click="refetch()"
    />

    <servo-entry-link
      v-for="entry in remainingEntries"
      :key="entry.CompEventEntryID"
      :entry="entry"
      :judge="data.Judge"
      :competition-id="data.Competition.CompetitionID"
    />
  </div>

  <div
    v-if="isFetching"
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

    <div v-if="data" class="flex flex-col gap-4 mt-2">
      <servo-entry-link
        v-for="entry in completedEntries"
        :key="entry.CompEventEntryID"
        :entry="entry"
        :judge="data.Judge"
        :competition-id="data.Competition.CompetitionID"
      />
    </div>
  </details>
</template>
