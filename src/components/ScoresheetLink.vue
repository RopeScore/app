<template>
  <router-link
    v-if="scoresheet"
    class="grid grid-cols-[3rem,auto] grid-rows-[max-content,max-content,max-content,max-content] rounded text-white p-2"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green',

      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo',

      'bg-gray-500': color === 'gray',
      'hover:bg-gray-600': color === 'gray'
    }"
    :to="`/score/rs/${groupId}/${entry.id}/${scoresheet.id}`"
  >
    <span class="row-span-4 flex justify-center items-center">{{ entry.heat }}</span>
    <span class="col-start-2 font-bold">{{ entry.category.name }}</span>
    <span class="col-start-2">{{ entry.participant.id }}: <span class="font-bold">{{ entry.participant.name }}</span></span>
    <span class="col-start-2">{{ scoresheet.rulesId }}: <span class="font-bold">{{ entry.competitionEventId }}</span></span>
    <span class="col-start-2">{{ scoresheet.judge.id }} (<span class="font-bold">{{ scoresheet.judgeType }}</span>): <span class="font-bold">{{ scoresheet.judge.name }}</span></span>
  </router-link>
</template>

<script lang="ts" setup>
import type { ScoresheetBaseFragment, MarkScoresheetFragment, Entry } from '../graphql/generated'
import type { PropType } from 'vue'

defineProps({
  entry: {
    type: Object as PropType<Pick<Entry, 'id' | 'heat' | 'category' | 'participant' | 'competitionEventId'>>,
    required: true
  },
  scoresheet: {
    type: Object as PropType<Pick<ScoresheetBaseFragment & MarkScoresheetFragment, 'id' | 'rulesId' | 'judge' | 'judgeType'> | undefined | null>,
    default: undefined
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
</script>
