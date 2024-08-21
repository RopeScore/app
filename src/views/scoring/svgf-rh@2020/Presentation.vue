<template>
  <main class="grid grid-cols-1 grid-rows-[9vh,1fr]">
    <score-button
      color="none"
      label="Score"
      :value="result"
      class="col-span-3"
      single-row
    />

    <section class="mx-2">
      <div v-for="field of fields" :key="field[0]">
        <vertical-scale
          :label="field[1]"
          :hints="field[2]"
          :value="tally(field[0])"
          :min="0"
          :max="10"
          :disabled="!!scoresheet?.completedAt"
          @update:value="handleUpdate(field[0], $event)"
        />
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScoresheet } from '../../../hooks/scoresheet'

import ScoreButton from '../../../components/ScoreButton.vue'
import VerticalScale from '../../../components/VerticalScale.vue'

import type { Model } from '../../../models'
import type { PropType } from 'vue'
import { handleScaleUpdateFactory } from '../../../helpers'

export type Schema = 'musicOnBeat' | 'interactions' | 'usingMusic' | 'movement'
| 'formExecution' | 'impression' | 'miss'

defineProps({
  model: {
    type: Object as PropType<Model>,
    required: true
  }
})

const { addMark, tally, scoresheet } = useScoresheet<Schema>()

type Definition = [Schema, string, string[]]

const musicOnBeat: Definition = ['musicOnBeat', 'Hoppar i takt till musiken', []]
musicOnBeat[2][0] = 'Helt i otakt, hela tiden.'
musicOnBeat[2][3] = 'Hoppar i takt ibland.'
musicOnBeat[2][5] = 'Hoppar i takt ungefär halva tiden.'
musicOnBeat[2][8] = 'Hoppar oftast i takt.'
musicOnBeat[2][10] = 'Hoppar i takt så gott som hela tiden.'

const interactions: Definition = ['interactions', 'Interaktioner', []]
interactions[2][0] = 'Inga interaktioner.'
interactions[2][5] = 'Några interaktioner.'
interactions[2][10] = 'Flera interaktioner.'

const usingMusic: Definition = ['usingMusic', 'Använder musiken', []]
usingMusic[2][0] = 'Använder inte musiken alls.'
usingMusic[2][2] = 'Använder musiken ett fåtal gånger (ca 2).'
usingMusic[2][5] = 'Använder musiken några gånger (ca 4).'
usingMusic[2][7] = 'Använder musiken flera gånger (ca 6).'
usingMusic[2][10] = 'Använder musiken många gånger (ca 10).'

const movement: Definition = ['movement', 'Rörelse', []]
movement[2][0] = 'Ingen rörelse över golvet, hoppar på samma ställe.'
movement[2][4] = 'Hopparna gör några förflyttningar.'
movement[2][7] = 'Hopparna förflyttar sig flera gånger.'
movement[2][10] = 'Hopparna rör sig över golvet i stort sett hela tiden.'

const formExecution: Definition = ['formExecution', 'Utförande, teknik', []]
formExecution[2][0] = 'Hopparna har mycket svårt att utföra freestylen.'
formExecution[2][3] = 'Flera gånger ser hoppningen ansträngd ut.'
formExecution[2][7] = 'Ibland set hoppningen ansträngd ut.'
formExecution[2][10] = 'Freestylen utförs med god teknik; smidigt och lätt.'

const impression: Definition = ['impression', 'Helhetsintryck', []]
impression[2][0] = 'Tråkig hoppning utan engagemang, glädje och variation.'
impression[2][3] = 'Underhållande hoppning preiodvis, några olika typer av trick.'
impression[2][7] = 'För det mesta underhållande hoppning med variation.'
impression[2][10] = 'Mycket underhållande hoppning; glädje och variation.'

const fields = computed(() => {
  const isDD = scoresheet.value?.competitionEventId.split('.')[3] === 'dd'
  const numSkippers = parseInt(scoresheet.value?.competitionEventId.split('.')[5] as string ?? '1', 10)
  let midMisses = 4

  if (!isDD && numSkippers >= 2) midMisses = 5 // srpf
  if (!isDD && numSkippers >= 4) midMisses = 6 // srtf
  if (isDD) midMisses = 3 // ddsf
  if (isDD && numSkippers >= 4) midMisses = 4 // ddpf

  const misses: Definition = ['miss', 'Missar', []]
  misses[2][0] = 'Missarna avlöser varandra i stort sett hela tiden.'
  misses[2][5] = `Flear missar (c:a ${midMisses}).`
  misses[2][10] = 'Felfri hoppning.'

  return [
    musicOnBeat,
    ...(isDD ? [interactions] : [usingMusic]),
    movement,
    formExecution,
    impression,
    misses
  ] as Definition[]
})

const result = computed(() => {
  const res = fields.value.map(s => tally(s[0]) ?? 0).reduce((a, b) => a + b, 0)
  return res
})

const handleUpdate = handleScaleUpdateFactory<Schema>(scoresheet, addMark)
</script>
