<script setup lang="ts">
import ScoreButton from '../components/ScoreButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { isClearMark, isUndoMark, useScoresheet } from '../hooks/scoresheet'
import { computed, onMounted, watch } from 'vue'
import { formatDate, numFmt } from '../helpers'

const router = useRouter()
const route = useRoute()
const scsh = useScoresheet()

function goBack () {
  router.go(-1)
}

onMounted(async () => {
  await scsh.open(route.params.system as string, ...route.params.vendor as string[])
})

watch(() => route.params, async (next, prev) => {
  if (next.system === prev.system &&
    (Array.isArray(next.vendor)
      ? next.vendor.every((p, idx) => p === prev.vendor[idx])
      : next.vendor === prev.vendor)
  ) {
    console.log('the specified scoresheet is already open')
    return
  }
  if (next.system && next.vendor) {
    await scsh.close()
    await scsh.open(next.system as string, ...next.vendor as string[])
  }
})

const undoneMarks = computed(() => {
  if (!scsh.scoresheet.value) return []
  const undone = []
  for (const mark of scsh.scoresheet.value.marks) {
    if (isUndoMark(mark)) {
      undone.push(mark.target)
    }
  }
  return undone
})

const startTime = computed(() => {
  return scsh.scoresheet.value?.marks?.at(0)?.timestamp ?? Date.now()
})

const lastClearMark = computed(() => {
  return scsh.scoresheet.value?.marks.findLast(mark => isClearMark(mark))?.sequence
})
</script>

<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
      @click="goBack()"
    />
  </nav>

  <main v-if="scsh.scoresheet.value" class="flex flex-col mb-2 p-2 gap-2">
    <div v-if="!scsh.scoresheet.value.marks || scsh.scoresheet.value.marks.length === 0">
      This scoresheet does not have any marks
    </div>

    <template v-else>
      <div class="text-center">
        Start of marks ({{ formatDate(scsh.scoresheet.value.marks.at(0)!.timestamp) }})
      </div>
      <div
        v-for="(mark, idx) of scsh.scoresheet.value.marks"
        :key="mark.timestamp"
        class="w-full rounded relative grid grid-cols-[3rem,auto] grid-rows-2 p-2"
        :class="{
          'bg-gray-500 text-white': (lastClearMark != null && mark.sequence < lastClearMark) || (undoneMarks.includes(mark.sequence) && !isUndoMark(mark) && !isClearMark(mark)),
          'bg-green-500 text-white': (lastClearMark == null || mark.sequence > lastClearMark) && !undoneMarks.includes(mark.sequence) && !isUndoMark(mark) && !isClearMark(mark),
          'bg-orange-500 text-black': (lastClearMark == null || mark.sequence > lastClearMark) && isUndoMark(mark),
          'bg-red-500 text-white': isClearMark(mark)
        }"
      >
        <span class="row-span-2 flex justify-center items-center">{{ mark.sequence }}</span>
        <span :class="{ 'line-through': undoneMarks.includes(mark.sequence) || (lastClearMark != null && mark.sequence < lastClearMark) }">{{ mark.schema }}</span>
        <span>{{ numFmt(mark.timestamp - startTime) }} ms (+{{ numFmt(mark.timestamp - (scsh.scoresheet.value.marks[idx - 1]?.timestamp ?? startTime)) }} ms)</span>
      </div>
      <div class="text-center">
        End of marks ({{ formatDate(scsh.scoresheet.value.marks.at(-1)!.timestamp) }})
      </div>
    </template>
  </main>
</template>
