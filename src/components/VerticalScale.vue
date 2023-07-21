<template>
  <fieldset class="mb-4">
    <legend class="my-1 w-full flex nowrap flex-row justify-between">
      <span>{{ label }}</span>
      <span v-if="missing" class="font-bold text-red-500">MISSING</span>
      <span v-else class="font-bold">{{ value }}</span>
    </legend>

    <label
      v-for="n, idx in range"
      :key="n"
      class="
        grid grid-cols-[1fr,2rem] w-full p-1
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

        'rounded-t': n === 0,
        'border-t-0': n !== 0,

        'rounded-b': n === props.max && noHalfPoint,
        'border-b-0': n !== props.max && noHalfPoint
      }"
    >
      <input
        v-model.number="selected"
        type="radio"
        :name="id"
        :value="n"
        :disabled="disabled"
        class="hidden"
        @change="handleClick()"
      >
      <span>{{ hints[idx] ?? '' }}</span>
      <span class="flex items-center justify-center">{{ n }}</span>
    </label>

    <label
      v-if="!noHalfPoint"
      class="
        grid grid-cols-[1fr,2rem] w-full p-1
        select-none touch-manipulation tap-transparent cursor-pointer
        bg-indigo-500  border border-indigo-600
        text-white
        hover:outline-none focus:outline-none
        rounded-b border-t-0
      "
      :class="{
        'bg-indigo-600': addHalf,

        'filter': disabled,
        'saturate-50': disabled,
        'cursor-default': disabled,

        'hover:bg-indigo-600': !disabled
      }"
    >
      <span>Add 0.5 points</span>
      <span class="flex items-center justify-center">
        <input
          v-model="addHalf"
          type="checkbox"
          :disabled="disabled"
          @change="handleClick()"
        >
      </span>
    </label>
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
    default: 0
  },
  max: {
    type: Number,
    default: 10
  },
  hints: {
    type: Array as PropType<Array<string | undefined>>,
    default: () => []
  },
  disabled: Boolean,
  noHalfPoint: Boolean
})

const emit = defineEmits(['update:value'])

const id = uuid().replace(/^\d+/, '')

const addHalf = ref(false)
const selected = ref<number>()
const missing = computed(() => selected.value == null || !range.value.includes(selected.value))

const range = computed(() => new Array(props.max - props.min + 1).fill(props.min).map((v: number, idx) => v + idx))

function propChange () {
  if (typeof props.value === 'number') {
    const checked = Math.ceil(props.value - 0.5)

    if (checked !== props.value) {
      addHalf.value = true
      selected.value = checked
    } else {
      selected.value = props.value
    }
  }
}

onMounted(propChange)
watch(() => props.value, propChange)

function handleClick () {
  let number = selected.value
  if (typeof number !== 'number') {
    emit('update:value', undefined)
    navigator.vibrate?.(props.vibration)
    return
  }
  if (addHalf.value && number !== props.max) number += 0.5
  emit('update:value', number)
  navigator.vibrate?.(props.vibration)
}
</script>
