<template>
  <fieldset class="mb-4">
    <legend class="my-1 w-full flex nowrap flex-row justify-between">
      <span>{{ label }}</span>
      <span v-if="missing" class="font-bold text-red-500">MISSING</span>
      <span v-else class="font-bold">{{ value }}</span>
    </legend>

    <div class="grid grid-cols-scale grid-rows-[4rem,max-content]">
      <label
        v-for="n in range"
        :key="n"
        class="
          flex justify-center w-full h-full p-1
          select-none touch-manipulation tap-transparent cursor-pointer
          border border-green-600
          hover:outline-none focus:outline-none
          text-white
        "
        :class="{
          'bg-green-600': n === selected,
          'bg-green-500': n !== selected,

          'filter': disabled,
          'saturate-50': disabled,
          'cursor-default': disabled,

          'hover:bg-green-600': !disabled,

          'rounded-l': n === min,
          'border-l-0': n !== min,

          'rounded-r': n === max,
          'border-r-0': n !== max
        }"
      >
        <input
          v-model.number="selected"
          type="radio"
          :name="id"
          :value="n "
          :disabled="disabled"
          class="hidden"
          @change="handleClick()"
        >
        <span class="flex items-center justify-center">{{ n }}</span>
      </label>
      <div
        v-for="n, idx in range"
        :key="`hint-${n}`"
        class="
          flex justify-center w-full
          select-none tap-transparent
        "
      >
        {{ hints[idx] ?? '' }}
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { v4 as uuid } from 'uuid'

import type { PropType } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: undefined
  },
  vibration: {
    type: Number,
    default: 75
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 3
  },
  hints: {
    type: Array as PropType<Array<string | undefined>>,
    default: () => []
  },
  disabled: Boolean
})

const emit = defineEmits(['update:value'])

const range = computed(() => new Array(props.max - props.min + 1).fill(props.min).map((v: number, idx) => v + idx))
const cols = computed(() => range.value.length)

const id = uuid().replace(/^\d+/, '')

const selected = ref<number>()
const missing = computed(() => props.value == null || !range.value.includes(props.value))

function propChange () {
  if (typeof props.value === 'number') {
    const checked = Math.ceil(props.value - 0.5)

    if (checked !== props.value) {
      selected.value = checked
    } else {
      selected.value = props.value
    }
  }
}

onMounted(propChange)
watch(() => props.value, propChange)

function handleClick () {
  if (typeof selected.value !== 'number') {
    emit('update:value', undefined)
    navigator.vibrate?.(props.vibration)
    return
  }
  emit('update:value', selected.value)
  navigator.vibrate?.(props.vibration)
}
</script>

<style scoped>
.grid-cols-scale {
  grid-template-columns: repeat(v-bind(cols), minmax(0, 1fr));
}
</style>
