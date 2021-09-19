<template>
  <div class="relative" :class="{ 'mt-2': !dense }">
    <input
      :id="id"
      :name="id"
      :type="type"
      :placeholder="dense ? label : ' '"
      :value="modelValue"
      :disabled="disabled"
      class="block border-0 border-b-gray-500 border-b-2 w-full bg-transparent"
      :class="{
        'p-0': dense,
        'px-0.5': dense,
        'm-0': dense,

        'pt-4': !dense,
        'pb-1': !dense,
        'px-3': !dense
      }"
      @input="input"
    >
    <label
      v-if="!dense"
      :for="id"
      class="absolute top-4 left-3 transition-all text-base text-dark-100 cursor-text"
    >{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuid } from 'uuid'

import type { PropType } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  dense: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as PropType<'text' | 'number' | 'date'>,
    default: 'text'
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const id = uuid().replace(/^[^a-z]+/, '')

function input (event: any) {
  if (props.type === 'number' || props.type === 'date') {
    emit('update:modelValue', (event.target as HTMLInputElement).valueAsNumber)
  } else {
    emit('update:modelValue', (event.target as HTMLInputElement).value)
  }
}
</script>

<style>
input:focus + label,
input:not(:placeholder-shown) + label {
  @apply top-0.5;
  @apply text-xs;
}
</style>
