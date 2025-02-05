<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import ScoreButton from '../components/ScoreButton.vue'
import { useRouter } from 'vue-router'
import { listScoresheets, isServoIntermediateScoresheet, isRemoteTallyScoresheet, isRemoteMarkScoresheet, type Scoresheet, type LocalScoresheet } from '../hooks/scoresheet'
import { formatDate } from '../helpers'
import JournalTally from '../components/JournalTally.vue'

const router = useRouter()

function goBack () {
  router.go(-1)
}

const scoresheets = computedAsync(async () => {
  const scoresheets = await listScoresheets()
  scoresheets.sort((a, b) => {
    if (a.createdAt != null && b.createdAt != null) return b.createdAt - a.createdAt
    else if (a.createdAt != null) return -1
    else if (b.createdAt != null) return 1
    else return b.id.localeCompare(a.id)
  })
  return scoresheets
})

function scoresheetType (scoresheet: Scoresheet<string>) {
  if (isServoIntermediateScoresheet(scoresheet)) return 'servo'
  else if (isRemoteMarkScoresheet(scoresheet) || isRemoteTallyScoresheet(scoresheet)) return 'rs'
  else return 'local'
}

function scoresheetLink (scoresheet: Scoresheet<string>) {
  const type = scoresheetType(scoresheet)
  if (type === 'rs') {
    // TODO real group and entry if we start storing rs scoresheets locally
    return `rs/group/entry/${scoresheet.id}`
  } else if (type === 'servo') {
    const [,competitionId, entryId, judgeSequence, scoresheetId] = scoresheet.id.split('::')
    return `servo/${competitionId}/${entryId}/${judgeSequence}/${scoresheetId}`
  } else return `local/${scoresheet.id}`
}
</script>

<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
      @click="goBack()"
    />
  </nav>

  <main class="flex flex-col mb-2 p-2 gap-2">
    <div
      v-for="scoresheet in scoresheets"
      :key="scoresheet.id"
      :to="`/scoresheet/${scoresheet.id}`"
      class="rounded text-white overflow-hidden cursor-pointer"
      :class="{
        'bg-green-500': scoresheetType(scoresheet) === 'rs',
        'bg-indigo-500': scoresheetType(scoresheet) === 'servo',
        'bg-gray-500': scoresheetType(scoresheet) === 'local'
      }"
    >
      <div class="w-full relative grid grid-cols-[4rem,auto,3rem] grid-rows-5 p-2">
        <div class="row-span-5 flex justify-center items-center">
          {{ scoresheetType(scoresheet) }}
        </div>
        <div class="col-start-2 col-end-2">
          ID: <span class="font-bold">{{ scoresheet.id }}</span>
        </div>
        <div class="col-start-2 col-end-2">
          Created: <span class="font-bold">{{ scoresheet.createdAt ? formatDate(scoresheet.createdAt) : 'Unknown' }}</span>
        </div>
        <div class="col-start-2 col-end-2">
          Competition Event: <span class="font-bold">{{ scoresheet.competitionEventId }}</span>
        </div>
        <div class="col-start-2 col-end-2">
          Rules: <span class="font-bold">{{ scoresheet.rulesId }}</span>
        </div>
        <div class="col-start-2 col-end-2">
          Judge Type: <span class="font-bold">{{ scoresheet.judgeType }}</span>
        </div>
      </div>
      <journal-tally :tally="(scoresheet as LocalScoresheet<string>).tally" />
      <div class="grid grid-cols-2 grid-rows-1">
        <router-link
          :to="`/score/${scoresheetLink(scoresheet)}`"
          class="block flex justify-center align-middle border-t p-2"
          :class="{
            'hover:bg-green-600': scoresheetType(scoresheet) === 'rs',
            'hover:bg-indigo-600': scoresheetType(scoresheet) === 'servo',
            'hover:bg-gray-600': scoresheetType(scoresheet) === 'local',

            'border-r': 'marks' in scoresheet,
            'col-span-2': !('marks' in scoresheet)
          }"
        >
          Show Scoresheet
        </router-link>
        <router-link
          v-if="'marks' in scoresheet"
          :to="`/scoresheets/${scoresheetLink(scoresheet)}/marks`"
          class="block flex justify-center align-middle border-t p-2"
          :class="{
            'hover:bg-green-600': scoresheetType(scoresheet) === 'rs',
            'hover:bg-indigo-600': scoresheetType(scoresheet) === 'servo',
            'hover:bg-gray-600': scoresheetType(scoresheet) === 'local'
          }"
        >
          Show Marks
        </router-link>
      </div>
    </div>
  </main>
</template>
