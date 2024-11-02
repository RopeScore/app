<template>
  <div class="text-xl line-height-none px-2 overflow-hidden whitespace-nowrap grid grid-cols-[min-content,1fr,min-content] max-w-full gap-2 justify-between">
    <div class="font-mono">
      <template v-if="isServoIntermediateScoresheet(scsh.scoresheet.value)">
        <span class="font-bold">H{{ scsh.scoresheet.value?.entry.heat }}</span>:{{ scsh.scoresheet.value?.entry.station }}
        #{{ scsh.scoresheet.value?.entry.id }}
      </template>

      <template v-else-if="isRemoteMarkScoresheet(scsh.scoresheet.value)">
        <span class="font-bold">H{{ scsh.scoresheet.value?.entry.heat }}</span>{{ scsh.scoresheet.value?.entry.pool != null ? `:${scsh.scoresheet.value?.entry.pool}`: '' }}
        <!-- #{{ scsh.scoresheet.value?.entry.id }} -->
      </template>
    </div>

    <div class="overflow-hidden text-center">
      <template v-if="isServoIntermediateScoresheet(scsh.scoresheet.value)">
        <span class="font-bold">{{ scsh.scoresheet.value?.judgeType }}</span>{{ scsh.scoresheet.value.judge.id }}:
        {{ scsh.scoresheet.value?.judge.name }}
      </template>
      <template v-else-if="isRemoteMarkScoresheet(scsh.scoresheet.value)">
        <span class="font-bold">{{ scsh.scoresheet.value.judgeType }}</span>: {{ scsh.scoresheet.value.judge.name }}
      </template>
    </div>

    <div class="font-mono">
      {{ version }} - <battery-status inline />
    </div>
  </div>
  <nav class="grid grid-cols-3 h-header">
    <template v-if="!confirmNext">
      <score-button
        v-if="!scsh.scoresheet.value?.submittedAt"
        label="Next Step"
        :vibration="500"
        @click="next()"
      />
      <score-button
        v-else
        label="Next Step"
        @click="immediateExit()"
      />

      <score-button
        v-if="!disableUndo"
        color="orange"
        label="Undo"
        @click="undo()"
      />
      <score-button
        v-else
        color="none"
        label=""
      />
    </template>
    <template v-else>
      <score-button
        v-if="!isLastStep"
        label="Next"
        @click="next('next')"
      />
      <score-button
        v-else
        label="Submit"
        @click="next('submit')"
      />
      <score-button
        label="Discard"
        color="red"
        @click="next('discard')"
      />
    </template>

    <score-button
      ref="resetRef"
      color="red"
      :label="resetNext ? 'Click Again' : 'Reset'"
      :vibration="resetNext ? 1000 : 500"
      :disabled="!!scsh.scoresheet.value?.submittedAt || !scsh.scoresheet.value"
      @click="reset()"
    />
  </nav>
</template>

<script lang="ts" setup>
import { computed, ref, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useScoresheet, isUndoMark, isServoIntermediateScoresheet, isRemoteMarkScoresheet } from '../hooks/scoresheet'
import { useConfirm } from '../hooks/confirm'
import ScoreButton from './ScoreButton.vue'
import { version } from '../helpers'
import BatteryStatus from './BatteryStatus.vue'

const router = useRouter()
const scsh = useScoresheet()

const props = defineProps({
  steps: {
    type: Array as PropType<string[]>,
    default: null
  },
  currentStep: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  'change:step': [step: string]
  undo: []
  clear: []
}>()

const isLastStep = computed(() => !Array.isArray(props.steps) || props.steps.length === 0 || props.currentStep === props.steps.at(-1))

const lastMarkSequence = computed(() => (scsh.scoresheet.value?.marks.length ?? 0) - 1)
const disableUndo = computed(() => {
  if (scsh.scoresheet.value?.completedAt) return true
  const marks = scsh.scoresheet.value?.marks ?? []
  return marks.length === 0 || isUndoMark(marks[marks.length - 1])
})

function undo () {
  void scsh.addMark({ schema: 'undo', target: lastMarkSequence.value })
  emit('undo')
}

const resetRef = ref(null)
const { fire: reset, fireNext: resetNext } = useConfirm(async () => {
  if (!scsh.scoresheet.value) return
  await scsh.addMark({ schema: 'clear' })
  if (Array.isArray(props.steps) && props.steps.length > 0) emit('change:step', props.steps[0])
  emit('clear')
}, resetRef)

const { fire: next, fireNext: confirmNext } = useConfirm(async (mode?: 'submit' | 'discard' | 'next') => {
  if (mode === 'next') {
    const nextStep = props.steps[props.steps.indexOf(props.currentStep) + 1]
    if (nextStep != null) emit('change:step', nextStep)
  } else {
    if (mode === 'submit') await scsh.complete()
    await scsh.close(mode === 'submit')
    router.go(-1)
  }
})

async function immediateExit () {
  await scsh.close(false)
  router.go(-1)
}
</script>
