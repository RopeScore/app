import idbReady from 'safari-14-idb-fix'
import * as idbKeyval from 'idb-keyval'
import { reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { apolloClient } from '../apollo'
import { provideApolloClient } from '@vue/apollo-composable'
import { type MarkScoresheetFragment, type ScoresheetBaseFragment, type TallyScoresheetFragment, useAddDeviceStreamMarkMutation, useAddStreamMarkMutation, useGroupScoresheetQuery, useOpenScoresheetMutation, useSaveScoresheetMutation } from '../graphql/generated'

import type { Ref } from 'vue'

export interface GenericMark<Schema extends string> {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: Schema
  readonly value?: number
}

export interface ClearMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: 'clear'
}
export function isClearMark (x: any): x is ClearMark { return x && x.schema === 'clear' }

export interface UndoMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: 'undo'
  readonly target: number
}
export function isUndoMark (x: any): x is UndoMark { return x && x.schema === 'undo' }

export type Mark<Schema extends string> = GenericMark<Schema> | UndoMark | ClearMark

export type MarkPayload<Schema extends string> = { schema: 'undo', target: number } | { schema: 'clear' } | { schema: Schema, value?: number }

export type ScoreTally<Schema extends string> = Partial<Record<Schema, number>>

export interface LocalScoresheet<T extends string> {
  id: string

  rulesId: string
  judgeType: string
  competitionEventId: string

  marks: Array<Mark<T>>

  openedAt?: number
  completedAt?: number
  submittedAt?: number

  options?: Partial<Record<string, any>> | null
}

export function isRemoteMarkScoresheet (x: any): x is ScoresheetBaseFragment & MarkScoresheetFragment { return x != null && typeof x === 'object' && !!x?.createdAt && 'marks' in x }
export function isRemoteTallyScoresheet (x: any): x is ScoresheetBaseFragment & TallyScoresheetFragment { return x != null && typeof x === 'object' && !!x?.createdAt && 'tally' in x }

export type Scoresheet<Schema extends string> = (ScoresheetBaseFragment & MarkScoresheetFragment & { marks: Array<Mark<Schema>> }) | LocalScoresheet<Schema>

interface UseScoresheetReturn<Schema extends string> {
  readonly scoresheet: Readonly<Ref<Scoresheet<Schema> | undefined>>

  tally: (schema: Schema) => number
  addMark: (mark: MarkPayload<Schema | 'undo' | 'clear'>) => Promise<void> | void
  complete: () => Promise<void> | void
  open: (system: string, ...vendor: string[]) => Promise<void> | void
  close: (save?: boolean) => Promise<void> | void
}

const scoresheet = ref<Scoresheet<string>>()
const system = ref<'local' | 'rs'>()
const tally = ref<ScoreTally<string>>(reactive({}))
const ready = idbReady()

function processMark <Schema extends string> (mark: MarkPayload<Schema>, marks: Array<Mark<Schema>>) {
  if (isUndoMark(mark)) {
    const undoneMark = marks[mark.target]
    if (!undoneMark) throw new Error('Undone mark missing')
    if (!isUndoMark(undoneMark) && !isClearMark(undoneMark)) {
      tally.value[undoneMark.schema] = (tally.value[undoneMark.schema] ?? 0) - (undoneMark.value ?? 1)
    }
  } else if (isClearMark(mark)) {
    tally.value = reactive({})
  } else {
    tally.value[(mark as GenericMark<Schema>).schema] = (tally.value[(mark as GenericMark<Schema>).schema] ?? 0) + ((mark as GenericMark<Schema>).value ?? 1)
  }
}

function addMark <Schema extends string> (mark: MarkPayload<Schema>) {
  const scsh = scoresheet.value
  if (!scsh) throw new Error('Scoresheet is not open')
  if (scsh.completedAt) throw Error('Can\'t change completed scoresheet')

  if (scsh.options?.live === true || scsh.options?.deviceStream === true) {
    provideApolloClient(apolloClient)
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  scsh.marks.push({
    timestamp: Date.now(),
    sequence: scsh.marks.length,
    ...mark
  } as Mark<Schema>)

  processMark(mark, scsh.marks)

  if (scsh.options?.live === true) {
    const mutation = useAddStreamMarkMutation({})
    mutation.mutate({
      scoresheetId: scsh.id,
      mark: {
        timestamp: Date.now(),
        sequence: scsh.marks.length - 1,
        ...mark
      },
      tally: tally.value
    })
  }

  if (scsh.options?.deviceStream === true) {
    const mutation = useAddDeviceStreamMarkMutation({})
    mutation.mutate({
      mark: {
        timestamp: Date.now(),
        sequence: scsh.marks.length - 1,
        ...mark
      },
      info: {
        competitionEventId: scsh.competitionEventId,
        rulesId: scsh.rulesId,
        judgeType: scsh.judgeType
      },
      tally: tally.value
    })
  }
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

  addMark({ schema: 'clear' })
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
      if (!entry) { reject(new Error(`RopeScore entry not found: ${scoresheetId}`)); return }
      if (!loaded) { reject(new Error(`RopeScore scoresheet not found: ${scoresheetId}`)); return }
      loaded = JSON.parse(JSON.stringify(loaded))
      if (!loaded) { reject(new Error(`RopeScore scoresheet not found: ${scoresheetId}`)); return }
      if (!isRemoteMarkScoresheet(loaded)) { reject(new Error(`RopeScore scoresheet is not a mark scoresheet: ${scoresheetId}`)); return }
      scoresheet.value = reactive({
        ...loaded,
        marks: loaded.marks as Array<Mark<string>>
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
      resolve(undefined); return
    }
    if (scoresheet.value.submittedAt) {
      console.warn('Scoresheet already completed, no need to save')
      resolve(undefined); return
    }
    const { mutate, onDone } = useSaveScoresheetMutation({})
    mutate({ scoresheetId: scoresheet.value.id, marks: scoresheet.value.marks, completedAt: scoresheet.value.completedAt })

    onDone(res => {
      if (res.errors) reject(res.errors)
      resolve(undefined)
    })
  })
}

export function useScoresheet <Schema extends string> (): UseScoresheetReturn<Schema> {
  return {
    scoresheet: scoresheet as Ref<Scoresheet<Schema>>,
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
      } else if (!scoresheet.value.completedAt) {
        switch (system.value) {
          case 'local':
          case 'rs':
            addMark({ schema: 'clear' })
            break
        }
      }
      scoresheet.value = undefined
      system.value = undefined
      tally.value = reactive({})
    }
  }
}

export async function createLocalScoresheet ({ judgeType, rulesId, competitionEventId, options }: { judgeType: string, rulesId: string, competitionEventId?: string, options?: Record<string, any> | null }) {
  const newScoresheet: LocalScoresheet<string> = {
    id: uuid(),
    judgeType,
    rulesId,
    competitionEventId: competitionEventId ?? '',
    marks: [],
    options
  }

  await idbKeyval.set(newScoresheet.id, newScoresheet)
  return newScoresheet.id
}

// TODO: list local, remove all local
