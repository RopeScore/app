<template>
  <div
    :id="`heat-${entry.HeatNumber}`"
    class="rounded text-white overflow-hidden cursor-pointer"
    :class="{
      'bg-green-500': color === 'green',
      'bg-indigo-500': color === 'indigo',
      'bg-gray-500': color === 'gray',
      'outline  outline-4 outline-red-500': currentHeat
    }"
  >
    <a
      class="w-full relative grid grid-cols-[3rem,auto,3rem] p-2"
      :class="{
        'hover:bg-green-600': color === 'green',
        'hover:bg-indigo-600': color === 'indigo',
        'hover:bg-gray-600': color === 'gray',

        'grid-rows-[max-content,max-content,max-content,max-content]': entry.GroupName == null,
        'grid-rows-[max-content,max-content,max-content,max-content,max-content]': entry.GroupName != null,
      }"
      role="button"
      @click="createScoresheet()"
    >
      <div class="flex justify-center items-center" :class="[entry.GroupName == null ? 'row-span-4' : 'row-span-5']">
        {{ entry.HeatNumber }}
      </div>
      <div class="col-start-2 col-end-2 font-bold">
        Entry#: {{ entry.EntryNumber }}
      </div>
      <div v-if="entry.GroupName != null" class="col-start-2 col-end-2 font-bold">
        {{ entry.GroupName }}
      </div>
      <div class="col-start-2 col-end-2" :class="{ 'font-bold': entry.GroupName == null }">
        {{ formatList(entry.Participants.map(p => `${p.FirstName} ${p.LastName}`)) }}
      </div>
      <div class="col-start-2 col-end-2">
        {{ entry.ScoringModelName }}: <span class="font-bold">{{ entry.EventTypeCode }}</span>
      </div>
      <div class="col-start-2 col-end-2">
        <span class="font-bold">{{ judge.JudgeType ?? '' }}</span>{{ judge.JudgeSequence }}:
        {{ judge.AssignedJudge?.FirstName ?? '' }} {{ judge.AssignedJudge?.LastName ?? '' }}
      </div>
      <div v-if="!entry.IsScratched && !entry.IsLocked" class="row-start-1 col-start-3 flex justify-center items-center" :class="[entry.GroupName == null ? 'row-span-4' : 'row-span-5']">
        <span v-if="!createScoresheetLoading">New</span>
        <span v-else>Loading</span>
      </div>
    </a>
    <div v-if="prevScoresheets.length > 0" class="grid grid-cols-1 grid-rows-1">
      <button
        v-if="prevScoresheets.length > 0"
        class="block flex justify-center align-middle border-t p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
        }"
        @click="showPrevious = !showPrevious"
      >
        <span v-if="showPrevious">Hide scoresheets</span>
        <span v-else>Show all scoresheets</span>
      </button>
    </div>

    <div>
      <a
        v-for="scoresheet of (showPrevious ? prevScoresheets : prevScoresheets.slice(0, 1))"
        :key="scoresheet.id"
        class="block border-t grid grid-rows-2 grid-cols-[min-content,auto] gap-x-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray'
        }"
        @click.prevent="openScoresheet(scoresheet.id)"
      >
        <div class="px-2 pt-2">Created</div>
        <div class="px-2 pt-2">{{ formatDate(scoresheet.createdAt) }}</div>

        <div class="px-2">Completed</div>
        <div class="px-2">{{ scoresheet.completedAt ? formatDate(scoresheet.completedAt) : 'No' }}</div>

        <journal-tally class="col-span-2" :tally="scoresheet.tally" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { type PropType, toRef, computed, ref, watch } from 'vue'
import { formatList, formatDate } from '../helpers'
import { type ServoJudge, type ServoEntry, createServoScoresheet, getServoScoresheetsForEntry, type ServoIntermediateScoresheet } from '../hooks/scoresheet'
import JournalTally from './JournalTally.vue'

const props = defineProps({
  entry: {
    type: Object as PropType<ServoEntry>,
    required: true
  },
  judge: {
    type: Object as PropType<ServoJudge>,
    required: true
  },
  competitionId: {
    type: Number,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  currentHeat: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits<{
  loadedLocal: []
}>()

const entry = toRef(props, 'entry')
const judge = toRef(props, 'judge')
const competitionId = toRef(props, 'competitionId')
const router = useRouter()

const showPrevious = ref(false)

const color = computed(() => {
  if (entry.value.IsScratched) return 'gray'
  else if (entry.value.IsJudgeScored) return 'indigo'
  else return 'green'
})

function openScoresheet (id: ServoIntermediateScoresheet<string>['id']) {
  const [,competitionId, entryId, judgeSequence, scoresheetId] = id.split('::')
  void router.push(`/score/servo/${competitionId}/${entryId}/${judgeSequence}/${scoresheetId}`)
}

const prevScoresheets = ref<Array<ServoIntermediateScoresheet<string>>>([])

watch(() => [
  entry.value,
  judge.value,
  competitionId.value
] as const, async ([newEn, newJu, newCId]) => {
  prevScoresheets.value = [...await getServoScoresheetsForEntry({
    competitionId: newCId,
    entryId: newEn.EntryNumber,
    judgeSequence: newJu.JudgeSequence
  })].sort((a, b) => b.createdAt - a.createdAt)
}, { immediate: true })

watch(prevScoresheets, () => {
  emit('loadedLocal')
}, { once: true })

const createScoresheetLoading = ref(false)
async function createScoresheet () {
  if (entry.value.IsScratched || entry.value.IsLocked) return
  if (createScoresheetLoading.value) return
  createScoresheetLoading.value = true
  try {
    const scoresheetId = await createServoScoresheet({
      competitionId: props.competitionId,
      entryId: entry.value.EntryNumber,
      judgeSequence: judge.value.JudgeSequence,
      judgeType: judge.value.JudgeType,
      scoringModel: entry.value.ScoringModelName,
      competitionEventId: entry.value.EventTypeCode,
      options: entry.value.EntryExtraData?.options,
      entry: {
        id: entry.value.EntryNumber,
        heat: entry.value.HeatNumber,
        station: props.stationName.replace(/[^\d]/g, '')
      },
      judge: {
        name: judge.value.AssignedJudge != null ? `${judge.value.AssignedJudge.FirstName ?? ''} ${judge.value.AssignedJudge.LastName ?? ''}`.trim() : undefined
      }
    })
    openScoresheet(scoresheetId)
  } finally {
    createScoresheetLoading.value = false
  }
}
</script>
