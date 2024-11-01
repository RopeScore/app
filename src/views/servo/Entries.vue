<script setup lang="ts">
import { useRouter } from 'vue-router'
import ScoreButton from '../../components/ScoreButton.vue'
import ServoEntryLink from '../../components/ServoEntryLink.vue'
import BatteryStatus from '../../components/BatteryStatus.vue'
import { useFetch } from '@vueuse/core'
import { useServoAuth } from '../../hooks/servo-auth'
import { computed, watch } from 'vue'
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
  beforeFetch ({ options, cancel }) {
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

watch(data, (newData, oldData) => {
  if (oldData == null && newData?.Session.CurrentHeatNumber != null) {
    scrollToHeat(newData.Session.CurrentHeatNumber)
  }
}, {
  flush: 'post'
})

const currentHeat = computed(() => data.value?.Session.CurrentHeatNumber ?? 1)

const entries = computed(() =>
  data.value
    ? [...data.value.Entries]
        .sort((a, b) => {
          if (a.HeatNumber !== b.HeatNumber) return (a.HeatNumber ?? Infinity) - (b.HeatNumber ?? Infinity)
          else return a.Participants[0].FirstName.localeCompare(b.Participants[0].FirstName)
        })
    : []
)

function scrollToHeat (heatNumber: number) {
  document.getElementById(`heat-${heatNumber}`)?.scrollIntoView({
    behavior: 'instant',
    block: 'center',
  })
}
</script>

<template>
  <nav class="grid grid-cols-3 h-header sticky top-0 bg-white z-2">
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

  <div class="p-2 pt-0 sticky top-[9vh] bg-white z-2">
    <h1 class="text-2xl">
      {{ data?.Competition.CompetitionName ?? ' ' }}
    </h1>
    <p>
      {{ data?.StationName ?? '' }} - {{ data?.Session.SessionName ?? '' }}
    </p>
    <p class="text-gray-600">
      {{ baseUrl ?? '' }}
    </p>

    <div class="grid grid-cols-2 gap-4">
      <score-button
        label="Refresh"
        single-row
        class="mx-0 py-4"
        color="orange"
        :disabled="data == null || isFetching"
        @click="refetch()"
      />
      <score-button
        label="Scroll to current"
        single-row
        class="mx-0 py-4"
        color="indigo"
        :disabled="data == null"
        @click="scrollToHeat(currentHeat)"
      />
    </div>
  </div>

  <div v-if="data" class="flex flex-col gap-4 px-2 mt-2">
    <servo-entry-link
      v-for="entry in entries"
      :key="entry.CompEventEntryID"
      :entry="entry"
      :judge="data.Judge"
      :competition-id="data.Competition.CompetitionID"
      :station-name="data.StationName"
      :current-heat="currentHeat === entry.HeatNumber"
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
</template>
