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

    <template v-if="Array.isArray(model.localAlternativeCompetitionEvents)">
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

    <template v-if="model.localOptions && model.localOptions.length > 0">
      <h2>Options</h2>
      <div v-for="option of model.localOptions" :key="option.prop">
        <checkbox-field
          v-if="option.type === 'boolean'"
          :label="option.name"
          :model-value="options[option.prop]"
          @update:model-value="options[option.prop] = $event"
        />
        <select
          v-else-if="option.type === 'single-select'"
          v-model="options[option.prop]"
          class="p-2 mt-4 rounded w-full"
        >
          <option
            v-for="desc in option.options"
            :key="desc"
            :value="desc"
          >
            {{ desc }}
          </option>
        </select>
        <div v-else>
          Unsupported option type
        </div>
      </div>
    </template>

    <button
      class="p-2 mt-4 text-center text-lg text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-500 rounded hover:outline-none focus:outline-none outline-none"
      :disabled="loading"
      @click="$emit('select', model, getPlainOptions(options), competitionEventLookupCode)"
    >
      Open
    </button>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, reactive } from 'vue'

import { CheckboxField } from '@ropescore/components'

import type { Model } from '../models'
import type { PropType } from 'vue'

const props = defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits<(e: 'select', model: Model, options?: Record<string, any>, competitionEventLookupCode?: string) => void>()

const competitionEventLookupCode = ref('')
const options = reactive<Record<string, any>>({})

function getPlainOptions (options: Record<string, any>) {
  return JSON.parse(JSON.stringify(options))
}

const rulesetList = computed(() => Array.isArray(props.model.rulesId) ? props.model.rulesId.join(', ') : props.model.rulesId)

onMounted(() => {
  if (Array.isArray(props.model.localAlternativeCompetitionEvents)) {
    competitionEventLookupCode.value = props.model.localAlternativeCompetitionEvents[0][1]
  } else {
    competitionEventLookupCode.value = props.model.localAlternativeCompetitionEvents
  }
})
</script>
