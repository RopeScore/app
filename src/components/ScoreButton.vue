<template>
  <button
    class="rounded select-none p-1 touch-manipulation hover:outline-none focus:outline-none outline-none tap-transparent"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green' && focus,

      'bg-orange-500': color === 'orange',
      'hover:bg-orange-600': color === 'orange' && focus,

      'bg-red-500': color === 'red',
      'hover:bg-red-600': color === 'red' && focus,

      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo' && focus,

      'bg-white': color === 'none',

      'cursor-pointer': color !== 'none',
      'm-2': color !== 'none',
      'text-white': color !== 'none',

      'cursor-default': color === 'none',
      'text-black': color === 'none'
    }"
    @click.prevent="handleClick()"
    @mousedown="focus = true"
    @mouseup="focus = false"
    @touchstart="focus = true"
    @touchend="focus = false"
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
          ['green', 'red', 'indigo', 'orange', 'none'].includes(value)
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
    disabled: Boolean,
    singleRow: Boolean
  },
  data: () => ({
    focus: false
  }),
  methods: {
    handleClick () {
      if (this.color === 'none') return
      navigator.vibrate?.(this.vibration)
    }
  }
})
</script>
