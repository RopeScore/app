<template>
  <button
    class="rounded select-none p-1 touch-manipulation focus:outline-none tap-transparent"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green',

      'bg-red-500': color === 'red',
      'hover:bg-red-600': color === 'red',

      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo',

      'bg-white': color === 'none',
      'hover:bg-white': color === 'none',

      'cursor-pointer': color !== 'none',
      'm-2': color !== 'none',
      'text-white': color !== 'none',

      'cursor-default': color === 'none',
      'focus:outline-none': color === 'none',
      'text-black': color === 'none'
    }"
    @click.prevent="handleClick()"
  >
    <template v-if="value === null || value === undefined">
      {{label}}
    </template>
    <template v-else-if="!singleRow">
      {{ label }}
      <br />
      {{ value }}
    </template>
    <template v-else>
      {{label}} ({{ value }})
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ScoreButton',
  props: {
    color: {
      validator (value: unknown) {
        return typeof value === 'string' &&
          ['green', 'red', 'indigo', 'none'].includes(value)
      },
      default: 'green'
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number]
    },
    vibration: {
      type: Number,
      default: 75
    },
    singleRow: Boolean
  },
  methods: {
    handleClick () {
      navigator.vibrate?.(this.vibration)
    }
  }
})
</script>
