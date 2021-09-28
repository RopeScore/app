<template>
  <fieldset class="mb-4">
    <legend class="my-1">
      {{ label }}
    </legend>

    <label
      v-for="n in 11"
      :key="n"
      class="
        grid grid-cols-[1fr,2rem] w-full p-1
        select-none touch-manipulation tap-transparent cursor-pointer
        bg-green-500 border border-green-600
        hover:outline-none focus:outline-none
        text-white
      "
      :class="{
        'bg-green-600': n - 1 === selected,

        'filter': disabled,
        'saturate-50': disabled,
        'cursor-default': disabled,

        'hover:bg-green-600': !disabled,

        'rounded-t': n - 1 === 0,
        'border-t-0': n - 1 !== 0
      }"
    >
      <input
        v-model.number="selected"
        type="radio"
        :name="id"
        :value="n - 1"
        :disabled="disabled"
        class="hidden"
        @change="handleClick()"
      >
      <span>{{ hints[n - 1] ?? '' }}</span>
      <span class="flex items-center justify-center">{{ n - 1 }}</span>
    </label>

    <label
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
      <span>Lägg till 0,5 poäng</span>
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
import { ref, onMounted } from 'vue'
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
  hints: {
    type: Array as PropType<Array<string | undefined>>,
    default: () => []
  },
  disabled: Boolean
})

const emit = defineEmits(['update:value'])

const id = uuid().replace(/^\d+/, '')

const addHalf = ref(false)
const selected = ref<number>()

onMounted(() => {
  if (typeof props.value === 'number') {
    const checked = Math.ceil(props.value - 0.5)

    if (checked !== props.value) {
      addHalf.value = true
      selected.value = checked
    } else {
      selected.value = props.value
    }
  }
})

function handleClick () {
  let number = selected.value
  if (typeof number !== 'number') {
    emit('update:value', undefined)
    navigator.vibrate?.(props.vibration)
    return
  }
  if (addHalf.value && number !== 10) number += 0.5
  emit('update:value', number)
  navigator.vibrate?.(props.vibration)
}
</script>
