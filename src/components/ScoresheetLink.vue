<template>
  <router-link
    class="block grid grid-cols-[3rem,auto] grid-rows-4 rounded text-white p-2"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green',

      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo'
    }"
    :to="`/score/rs/${groupId}/${scoresheet.id}`"
  >
    <span class="row-span-4 flex justify-center items-center">{{ scoresheet.heat }}</span>
    <span class="col-start-2 font-bold">{{ scoresheet.categoryName }}</span>
    <span class="col-start-2">{{ scoresheet.participantId }}: <span class="font-bold">{{ scoresheet.participantName }}</span></span>
    <span class="col-start-2">{{ scoresheet.rulesId }}: <span class="font-bold">{{ scoresheet.competitionEventLookupCode }}</span></span>
    <span class="col-start-2">{{ scoresheet.judgeId }} (<span class="font-bold">{{ scoresheet.judgeType }}</span>): <span class="font-bold">{{ scoresheet.judgeName }}</span></span>
  </router-link>
</template>

<script lang="ts" setup>
import type { Scoresheet } from '../graphql/generated'
import type { PropType } from 'vue'

defineProps({
  scoresheet: {
    type: Object as PropType<Pick<Scoresheet, 'id' | 'heat' | 'categoryName' | 'participantId' | 'participantName' | 'rulesId' | 'competitionEventLookupCode' | 'judgeId' | 'judgeType' | 'judgeName'>>,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  color: {
    validator (value: unknown) {
      return typeof value === 'string' &&
        ['green', 'indigo'].includes(value)
    },
    default: 'green'
  }
})
</script>
