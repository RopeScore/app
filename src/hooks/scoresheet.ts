import idbReady from 'safari-14-idb-fix'
import * as idbKeyval from 'idb-keyval'
import { reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { apolloClient } from '../apollo'
import { provideApolloClient } from '@vue/apollo-composable'
import { useGroupScoresheetQuery, useOpenScoresheetMutation, useSaveScoresheetMutation } from '../graphql/generated'

import type { Ref } from 'vue'

import type { schemas as ijru_1_1_0_diff_schemas } from '../views/scoring/ijru@1.1.0/Difficulty.vue'
import type { schemas as ijru_1_1_0_speed_schemas } from '../views/scoring/ijru@1.1.0/Speed.vue'
import type { schemas as ijru_2_0_0_ath_pres_schemas } from '../views/scoring/ijru@2.0.0/AthletePresentation.vue'
import type { schemas as ijru_2_0_0_rout_pres_schemas } from '../views/scoring/ijru@2.0.0/RoutinePresentation.vue'
import type { schemas as ijru_2_0_0_req_el_schemas } from '../views/scoring/ijru@2.0.0/RequiredElements.vue'
import type { schemas as svgf_rh_2020_diff_schemas } from '../views/scoring/svgf-rh@2020/Difficulty.vue'
import type { schemas as svgf_rh_2020_pres_schemas } from '../views/scoring/svgf-rh@2020/Presentation.vue'

export type Schemas = ijru_1_1_0_diff_schemas | ijru_1_1_0_speed_schemas
| ijru_2_0_0_ath_pres_schemas | ijru_2_0_0_rout_pres_schemas
| ijru_2_0_0_req_el_schemas | svgf_rh_2020_diff_schemas | svgf_rh_2020_pres_schemas

export interface GenericMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: Schemas
  readonly value?: number
}

export interface UndoMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: 'undo'
  readonly target: number
}
export function isUndoMark (x: any): x is UndoMark { return x && x.schema === 'undo' }

export type Mark = GenericMark | UndoMark

export type MarkPayload = { schema: 'undo', target: number } | { schema: Schemas, value?: number }

export type ScoreTally = Partial<Record<Schemas, number>>

export interface LocalScoresheet {
  id: string

  competitionEventLookupCode: string
  rulesId: string
  judgeType: string

  marks: Mark[]

  openedAt?: number
  completedAt?: number
  submittedAt?: number
}

export interface RemoteScoresheet {
  id: string

  // information to the core system so it knows where to route the results
  categoryId: string
  competitionEventLookupCode: string
  participantId: string
  judgeId: string
  rulesId: string
  judgeType: string

  // stuff for display
  participantName: string
  judgeName: string
  categoryName: string

  // some metadata
  createdAt: number // server
  updatedAt: number // server
  submittedAt?: number | null // server
  openedAt?: number[] | null // app
  completedAt?: number | null // app
  didNotSkipAt?: number | null // server
  heat: number

  // optional feature toggles
  options?: Object | null

  marks: Mark[]
}

export type Scoresheet = RemoteScoresheet | LocalScoresheet

interface UseScoresheetReturn {
  readonly scoresheet: Readonly<Ref<Scoresheet | undefined>>

  tally: (schema: Schemas) => number
  addMark: (mark: MarkPayload) => Promise<void> | void
  complete: () => Promise<void> | void
  open: (system: string, ...vendor: string[]) => Promise<void> | void
  close: (save?: boolean) => Promise<void> | void
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  reset: () => Promise<string[] | void> | string[] | void
}

const scoresheet = ref<Scoresheet>()
const system = ref<'local' | 'rs'>()
const tally = ref<ScoreTally>(reactive({}))
const ready = idbReady()

const processMark = (mark: MarkPayload, marks: Mark[]) => {
  if (isUndoMark(mark)) {
    const undoneMark = marks[mark.target]
    if (!undoneMark) throw new Error('Undone mark missing')
    if (!isUndoMark(undoneMark)) {
      tally.value[undoneMark.schema] = (tally.value[undoneMark.schema] ?? 0) - (undoneMark.value ?? 1)
    }
  } else {
    tally.value[(mark as GenericMark).schema] = (tally.value[(mark as GenericMark).schema] ?? 0) + ((mark as GenericMark).value ?? 1)
  }
}

const addMark = (mark: MarkPayload) => {
  const scsh = scoresheet.value
  if (!scsh) throw new Error('Scoresheet is not open')
  if (scsh.completedAt) throw Error('Can\'t change completed scoresheet')

  scsh.marks.push({
    timestamp: Date.now(),
    sequence: scsh.marks.length,
    ...mark
  })

  processMark(mark, scsh.marks)
}

const complete = () => {
  if (!scoresheet.value) {
    console.error(new Error('Scoresheet is not open'))
    return
  }
  if (scoresheet.value.completedAt) {
    console.warn('Scoresheet already completed, not marking completed')
    return
  }
  scoresheet.value.completedAt = Date.now()
}

const openLocal = async (id: string) => {
  await ready
  let loaded = await idbKeyval.get(id)
  if (!loaded) throw new Error('Local scoresheet not found')
  loaded = reactive(loaded)

  scoresheet.value = loaded
  system.value = 'local'
}

const closeLocal = async () => {
  if (!scoresheet.value) {
    console.error(new Error('Scoresheet is not open'))
    return
  }
  if (scoresheet.value.submittedAt) {
    console.warn('Scoresheet already completed, no need to save')
    return
  }
  if (scoresheet.value.completedAt) scoresheet.value.submittedAt = Date.now()
  await ready
  await idbKeyval.set(scoresheet.value.id, JSON.parse(JSON.stringify(scoresheet.value)))
}

const resetLocal = async ({ complete }: Pick<UseScoresheetReturn, 'complete'>) => {
  if (!scoresheet.value) {
    console.warn('No scoresheet open, cannot reset')
    return
  }
  const { id, marks, completedAt, openedAt, ...rest } = scoresheet.value
  await complete()
  const newId = await createLocalScoresheet(rest)
  return [newId]
}

const openRs = async (groupId: string, entryId: string, scoresheetId: string) => {
  return new Promise((resolve, reject) => {
    provideApolloClient(apolloClient)
    const enabled = ref(true)
    const { onResult } = useGroupScoresheetQuery({
      groupId,
      entryId,
      scoresheetId
    }, {
      fetchPolicy: 'network-only',
      // according to the docs refs are actually supported, nay, expected here
      enabled: enabled as unknown as boolean
    })

    onResult(res => {
      const entry = res.data.group?.entry
      let loaded = res.data.group?.entry?.scoresheet
      if (!entry) return reject(new Error(`RopeScore entry not found: ${scoresheetId}`))
      if (!loaded) return reject(new Error(`RopeScore scoresheet not found: ${scoresheetId}`))
      loaded = JSON.parse(JSON.stringify(loaded))
      if (!loaded) return reject(new Error(`RopeScore scoresheet not found: ${scoresheetId}`))
      scoresheet.value = reactive({
        categoryId: entry.categoryId,
        competitionEventLookupCode: entry.competitionEventLookupCode,
        participantId: entry.participantId,
        participantName: entry.participantName,
        categoryName: entry.categoryName,
        heat: entry.heat,
        ...loaded,
        marks: loaded.marks as Mark[]
      })
      system.value = 'rs'
      enabled.value = false

      if (!scoresheet.value.completedAt) {
        const { mutate } = useOpenScoresheetMutation({})
        mutate({ scoresheetId, openedAt: Date.now() })
      }

      resolve(undefined)
    })
  })
}

const closeRs = async () => {
  return new Promise((resolve, reject) => {
    provideApolloClient(apolloClient)
    if (!scoresheet.value) {
      console.error(new Error('Scoresheet is not open'))
      return resolve(undefined)
    }
    if (scoresheet.value.submittedAt) {
      console.warn('Scoresheet already completed, no need to save')
      return resolve(undefined)
    }
    const { mutate, onDone } = useSaveScoresheetMutation({})
    mutate({ scoresheetId: scoresheet.value.id, marks: scoresheet.value.marks, completedAt: scoresheet.value.completedAt })

    onDone(res => {
      if (res.errors) reject(res.errors)
      resolve(undefined)
    })
  })
}

const resetRs = async ({ complete }: Pick<UseScoresheetReturn, 'complete'>) => {
  if (!scoresheet.value) {
    console.warn('No scoresheet open, cannot reset')
    return
  }
  scoresheet.value.marks = []
  tally.value = reactive({})
}

export function useScoresheet (): UseScoresheetReturn {
  return {
    scoresheet,
    tally: (schema) => tally.value[schema] ?? 0,

    addMark,
    complete,
    async open (system, ...vendor) {
      console.log('open called with system', system, 'and vendor parameters', vendor)
      switch (system) {
        case 'local':
          await openLocal(vendor[0])
          break
        case 'rs':
          await openRs(vendor[0], vendor[1], vendor[2])
          break
        default:
          throw new TypeError('Unknown system specified, cannot open scoresheet')
      }

      tally.value = reactive({})

      const marks = scoresheet.value?.marks ?? []

      for (const mark of marks) processMark(mark, marks)
    },
    async close (save: boolean = true) {
      if (!scoresheet.value) return
      if (save) {
        switch (system.value) {
          case 'local':
            await closeLocal()
            break
          case 'rs':
            await closeRs()
            break
          default:
            throw new TypeError('Unknown system specified, cannot open scoresheet')
        }
      }
      scoresheet.value = undefined
      system.value = undefined
      tally.value = reactive({})
    },
    async reset () {
      switch (system.value) {
        case 'local':
          return await resetLocal({ complete })
        case 'rs':
          return await resetRs({ complete })
        default:
          throw new TypeError('Unknown system specified, cannot open scoresheet')
      }
    }
  }
}

export async function createLocalScoresheet ({ judgeType, rulesId, competitionEventLookupCode }: { judgeType: string, rulesId: string, competitionEventLookupCode?: string }) {
  const newScoresheet: LocalScoresheet = {
    id: uuid(),
    judgeType,
    rulesId,
    competitionEventLookupCode: competitionEventLookupCode ?? '',
    marks: []
  }

  await idbKeyval.set(newScoresheet.id, newScoresheet)
  return newScoresheet.id
}

// TODO: list local, remove all local
