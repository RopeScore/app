<script setup lang="ts">
import type { ScoreTally } from '@ropescore/rulesets'
import type { PropType } from 'vue'

defineProps({
  tally: {
    type: Object as PropType<ScoreTally>,
    required: true,
  }
})
</script>

<template>
  <div class="journal-container flex flex-wrap flex-row w-full">
    <div v-for="v, k of tally" :key="k" class="even-odd p-4 flex-1">
      <span>{{ k }}:</span>
      <br>
      <span class="text-2xl">{{ v }}</span>
    </div>
  </div>
</template>

<style scoped>
.journal-container .even-odd:nth-child(even) {
  background-color: #00000022;
}
</style>
