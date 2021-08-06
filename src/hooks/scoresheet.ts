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

export type Schemas = ijru_1_1_0_diff_schemas | ijru_1_1_0_speed_schemas
| ijru_2_0_0_ath_pres_schemas | ijru_2_0_0_rout_pres_schemas
| ijru_2_0_0_req_el_schemas

export interface GenericMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: Schemas
}

export interface UndoMark {
  readonly timestamp: number
  readonly sequence: number
  readonly schema: 'undo'
  readonly target: number
}

export type Mark = GenericMark | UndoMark

export type MarkPayload = { schema: 'undo', target: number } | { schema: Schemas }

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
  close: () => Promise<void> | void
}

const scoresheet = ref<Scoresheet>()
const system = ref<'local' | 'rs'>()
const tally = ref<ScoreTally>(reactive({}))
const ready = idbReady()

const addMark = (mark: MarkPayload) => {
  const scsh = scoresheet.value
  if (!scsh) throw new Error('Scoresheet is not open')
  if (scsh.completedAt) throw Error('Can\'t change completed scoresheet')

  scsh.marks.push({
    timestamp: Date.now(),
    sequence: scsh.marks.length,
    ...mark
  })

  if (mark.schema === 'undo') {
    const undoneMark = scsh.marks[mark.target]
    if (!undoneMark) throw new Error('Undone mark missing')
    if (undoneMark.schema !== 'undo') {
      tally.value[undoneMark.schema] = (tally.value[undoneMark.schema] ?? 0) - 1
    }
  } else {
    tally.value[mark.schema] = (tally.value[mark.schema] ?? 0) + 1
  }
}

const complete = () => {
  if (!scoresheet.value) {
    console.error(new Error('Scoresheet is not open'))
    return
  }
  if (scoresheet.value.completedAt) {
    console.warn('Scoresheet already completed, nor marking completed')
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

const openRs = async (groupId: string, scoresheetId: string) => {
  return new Promise((resolve, reject) => {
    provideApolloClient(apolloClient)
    const enabled = ref(true)
    const { onResult } = useGroupScoresheetQuery({
      groupId,
      scoresheetId
    }, {
      fetchPolicy: 'network-only',
      // according to the docs refs are actually supported, nay, expected here
      enabled: enabled as unknown as boolean
    })

    onResult(res => {
      console.log('got result')
      let loaded = res.data.group?.scoresheet
      if (!loaded) return reject(new Error(`RopeScore scoresheet not found: ${scoresheetId}`))
      loaded = reactive(JSON.parse(JSON.stringify(loaded)))
      scoresheet.value = loaded as RemoteScoresheet
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
          await openRs(vendor[0], vendor[1])
          break
        default:
          throw new TypeError('Unknown system specified, cannot open scoresheet')
      }

      tally.value = reactive({})

      for (const mark of scoresheet.value?.marks ?? []) {
        if (mark.schema === 'undo') continue
        tally.value[mark.schema] = (tally.value[mark.schema] ?? 0) + 1
      }
    },
    async close () {
      if (!scoresheet.value) return
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
      scoresheet.value = undefined
      system.value = undefined
      tally.value = reactive({})
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
