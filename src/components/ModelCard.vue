<template>
  <section
    class="rounded bg-gray-100 my-2 p-2 shadow flex justify-center flex-col m-2"
  >
    <h1 class="text-center text-lg font-bold">{{ model.name }}</h1>
    <p class="text-center text-gray-600">{{ rulesetList }}</p>
    <template v-if="model.localAlternativeCompetitionEvents">
      <select class="p-2 mt-4 rounded" v-model="competitionEventLookupCode">
        <option
          v-for="[desc, compEvt] in model.localAlternativeCompetitionEvents"
          :key="desc"
          :value="compEvt"
        >{{ desc }}</option>
      </select>
    </template>
    <button
      @click="$emit('select', model, competitionEventLookupCode)"
      class="p-2 mt-4 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded hover:outline-none focus:outline-none outline-none"
    >Open</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Model } from '../models'

export default defineComponent({
  name: 'ModelCard',
  props: {
    model: {
      type: Object as PropType<Model>,
      required: true
    }
  },
  data: () => ({
    competitionEventLookupCode: ''
  }),
  computed: {
    rulesetList (): string {
      return Array.isArray(this.model.rulesId) ? this.model.rulesId.join(', ') : this.model.rulesId
    }
  }
})
</script>
