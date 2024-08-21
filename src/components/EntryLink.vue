<template>
  <div
    v-if="assignment"
    class="rounded text-white overflow-hidden cursor-pointer"
    :class="{
      'bg-green-500': color === 'green',
      'bg-indigo-500': color === 'indigo',
      'bg-gray-500': color === 'gray',
    }"
  >
    <div
      class="w-full relative grid grid-cols-[3rem,auto,3rem] grid-rows-4 p-2"
      :disabled="createScoresheetMutation.loading.value"
      :class="{
        'hover:bg-green-600': color === 'green' && (!entry.didNotSkipAt || (entry.didNotSkipAt && markScoresheets.length > 0)),
        'hover:bg-indigo-600': color === 'indigo' && (!entry.didNotSkipAt || (entry.didNotSkipAt && markScoresheets.length > 0)),
        'hover:bg-gray-600': color === 'gray' && (!entry.didNotSkipAt || (entry.didNotSkipAt && markScoresheets.length > 0))
      }"
      role="button"
      @click="openUncompletedOrCreate()"
    >
      <div class="row-span-4 flex justify-center items-center">
        {{ entry.heat }}{{ entry.pool != null ? `:${entry.pool}` : '' }}
      </div>
      <div class="col-start-2 col-end-2 font-bold">
        {{ entry.category.name }}
      </div>
      <div class="col-start-2 col-end-2 font-bold">
        {{ entry.participant.name }}
      </div>
      <div class="col-start-2 col-end-2">
        {{ entry.category.rulesId }}: <span class="font-bold">{{ entry.competitionEventId }}</span>
      </div>
      <div class="col-start-2 col-end-2">
        <span class="font-bold">{{ assignment?.judgeType }}</span>: {{ judge.name }}
      </div>
      <div v-if="!entry.didNotSkipAt || (entry.lockedAt && markScoresheets.length > 0)" class="row-span-4 row-start-1 col-start-3 flex justify-center items-center">
        <span v-if="!createScoresheetMutation.loading.value">Open</span>
        <span v-else>Loading</span>
      </div>
    </div>
    <div class="grid grid-cols-2 grid-rows-1">
      <button
        v-if="markScoresheets.length > 0"
        class="block flex justify-center align-middle border-t border-r p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
          'col-span-2': entry.didNotSkipAt || entry.lockedAt
        }"
        @click="showPrevious = !showPrevious"
      >
        <span v-if="showPrevious">Hide Previous</span>
        <span v-else>Show Previous</span>
      </button>
      <button
        v-if="!entry.didNotSkipAt && !entry.lockedAt"
        class="block flex justify-center align-middle border-t p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
          'col-span-2': markScoresheets.length === 0
        }"
        :disabled="createScoresheetMutation.loading.value"
        @click="createScoresheet()"
      >
        <span v-if="!createScoresheetMutation.loading.value">Create New</span>
        <span v-else>Loading</span>
      </button>
    </div>

    <div v-if="showPrevious">
      <router-link
        v-for="scoresheet of markScoresheets"
        :key="scoresheet.id"
        class="p-2 border-t grid grid-rows-2 grid-cols-[min-content,auto] gap-x-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray'
        }"
        :to="`/score/rs/${props.groupId}/${entry.id}/${scoresheet.id}`"
      >
        <div>Created</div><div>{{ formatDate(scoresheet.createdAt) }}</div>
        <div>Completed</div><div>{{ scoresheet.completedAt ? formatDate(scoresheet.completedAt) : 'No' }}</div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ScoresheetBaseFragment, type MarkScoresheetFragment, type Entry, useCreateMarkScoresheetMutation, type AthleteFragment, type TeamFragment, type Category, type JudgeFragment, type JudgeAssignment } from '../graphql/generated'
import { useRouter } from 'vue-router'
import { type PropType, toRef, ref, computed } from 'vue'
import { formatDate } from '../helpers'

const props = defineProps({
  entry: {
    type: Object as PropType<Pick<Entry, 'id' | 'heat' | 'pool' | 'competitionEventId' | 'didNotSkipAt' | 'lockedAt'> & { participant: Pick<AthleteFragment | TeamFragment, 'id' | 'name'>, category: Pick<Category, 'id' | 'name' | 'rulesId'> }>,
    required: true
  },
  scoresheets: {
    type: Array as PropType<Array<Pick<ScoresheetBaseFragment & MarkScoresheetFragment, 'id' | 'rulesId' | 'createdAt' | 'completedAt' | '__typename'>> | undefined | null>,
    required: true
  },
  judge: {
    type: Object as PropType<JudgeFragment>,
    required: true
  },
  assignments: {
    type: Array as PropType<Array<Pick<JudgeAssignment, 'id' | 'competitionEventId' | 'judgeType'> & { category: Pick<Category, 'id'> }>>,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  color: {
    validator (value: unknown) {
      return typeof value === 'string' &&
    ['green', 'indigo', 'gray'].includes(value)
    },
    default: 'green'
  }
})

const entry = toRef(props, 'entry')
const _scoresheets = toRef(props, 'scoresheets')
const markScoresheets = computed(() => _scoresheets.value?.filter(scsh => scsh.__typename === 'MarkScoresheet') ?? [])
const judge = toRef(props, 'judge')
const router = useRouter()

const assignments = toRef(props, 'assignments')
const assignment = computed(() => assignments.value?.find(a => a.competitionEventId === entry.value.competitionEventId && a.category.id === entry.value.category.id))

const showPrevious = ref(false)

const createScoresheetMutation = useCreateMarkScoresheetMutation({
  refetchQueries: ['GroupScoresheets']
})

async function createScoresheet () {
  const res = await createScoresheetMutation.mutate({
    entryId: entry.value.id,
    judgeId: judge.value.id,
    data: {}
  })

  if (!res?.data?.createMarkScoresheet.id) return

  await router.push(`/score/rs/${props.groupId}/${entry.value.id}/${res.data.createMarkScoresheet.id}`)
}

async function openUncompletedOrCreate () {
  if (createScoresheetMutation.loading.value) return
  const scoresheet = (markScoresheets.value ?? []).reverse().find(scsh => scsh.completedAt) ??
    (markScoresheets.value ?? [])
      .filter(scsh => !scsh.completedAt)
      .at(-1)

  if (scoresheet?.id) {
    await router.push(`/score/rs/${props.groupId}/${entry.value.id}/${scoresheet.id}`)
  } else {
    const res = await createScoresheetMutation.mutate({
      entryId: entry.value.id,
      judgeId: judge.value.id,
      data: {}
    })

    if (!res?.data?.createMarkScoresheet.id) return

    await router.push(`/score/rs/${props.groupId}/${entry.value.id}/${res.data.createMarkScoresheet.id}`)
  }
}
</script>
