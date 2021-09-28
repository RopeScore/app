<template>
  <section
    class="rounded bg-gray-100 my-2 p-2 shadow flex justify-center flex-col m-2"
  >
    <h1 class="text-center text-lg font-bold">
      {{ model.name }}
    </h1>
    <p class="text-center text-gray-600">
      {{ rulesetList }}
    </p>
    <template v-if="model.localAlternativeCompetitionEvents">
      <select
        v-model="competitionEventLookupCode"
        class="p-2 mt-4 rounded"
      >
        <option
          v-for="[desc, compEvt] in model.localAlternativeCompetitionEvents"
          :key="desc"
          :value="compEvt"
        >
          {{ desc }}
        </option>
      </select>
    </template>
    <button
      class="p-2 mt-4 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none focus:outline-none outline-none"
      @click="$emit('select', model, competitionEventLookupCode)"
    >
      Open
    </button>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'

import type { Model } from '../models'
import type { PropType } from 'vue'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

defineEmits<(e: 'select', model: Model, competitionEventLookupCode?: string) => void>()

const competitionEventLookupCode = ref('')

const rulesetList = computed(() => Array.isArray(props.model.rulesId) ? props.model.rulesId.join(', ') : props.model.rulesId)

onMounted(() => {
  if (props.model.localAlternativeCompetitionEvents) {
    competitionEventLookupCode.value = props.model.localAlternativeCompetitionEvents[0][1]
  }
})
</script>
