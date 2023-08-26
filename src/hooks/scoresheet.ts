import idbReady from 'safari-14-idb-fix'
import * as idbKeyval from 'idb-keyval'
import { reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { apolloClient } from '../apollo'
import { provideApolloClient } from '@vue/apollo-composable'
import { type MarkScoresheetFragment, type ScoresheetBaseFragment, type TallyScoresheetFragment, useAddDeviceStreamMarkMutation, useAddStreamMarkMutation, useGroupScoresheetQuery, useOpenScoresheetMutation, useSaveScoresheetMutation } from '../graphql/generated'

import type { Ref } from 'vue'
import { useServoAuth } from './servo-auth'
import router from '../router'
import { isObject, useBattery } from '@vueuse/core'
import { version } from '../helpers'
import models from '../models'
import useNotifications from './notifications'

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

export interface ServoIntermediateScoresheet<T extends string> {
  id: `servo::${number}::${number}::${number}::${string}`

  // These need to be mapped from servo format and stored in RS App format here
  rulesId: string
  judgeType: string
  competitionEventId: string

  marks: Array<Mark<T>>

  createdAt: number
  openedAt?: number
  completedAt?: number
  submittedAt?: number

  options?: Partial<Record<string, any>> | null
}
export function isServoIntermediateScoresheet (x: unknown): x is ServoIntermediateScoresheet<string> {
  return isObject(x) && 'id' in x && typeof x.id === 'string' && x.id.startsWith('servo::')
}

export function isRemoteMarkScoresheet (x: unknown): x is ScoresheetBaseFragment & MarkScoresheetFragment {
  return isObject(x) && 'createdAt' in x && !!x?.createdAt && 'marks' in x
}
export function isRemoteTallyScoresheet (x: unknown): x is ScoresheetBaseFragment & TallyScoresheetFragment {
  return isObject(x) && 'createdAt' in x && !!x?.createdAt && 'tally' in x
}

export type Scoresheet<Schema extends string> = (ScoresheetBaseFragment & MarkScoresheetFragment & { marks: Array<Mark<Schema>> }) | LocalScoresheet<Schema>

export interface ServoEntry {
  CompEventEntryID: string
  EntryNumber: number
  HeatNumber: number
  HeatID: number
  CompetitionEventID: number
  EventDefinitionName: string
  EventDefinitionAbbr: number
  ScoringModelName: string
  EventTypeCode: string // competitionEventLookupCode
  IsScored: boolean
  IsScratched: boolean
  IsLocked: boolean
  TeamName: string
  HasJudgeScoreData: boolean
  IsJudgeScored: boolean
  Participants: Array<{
    FirstName: string
    LastName: string
    TeamName: string
  }>
  ScoringRulesConfig: Record<string, unknown>
}

export interface ServoSession {
  SessionID: number
  SessionName: string
  CompetitionDay: number
  CurrentHeatNumber: number | null
}

export interface ServoJudge {
  JudgeSequence: number
  JudgeType: null // TODO
}

export interface ServoCompetition {
  CompetitionID: number
  CompetitionName: string
}

export interface AssignmentCodeLookupResponse {
  StationID: number
  StationName: string
  Session: ServoSession
  Judge: ServoJudge
  Competition: ServoCompetition
  Entries: ServoEntry[]
}

interface UseScoresheetReturn<Schema extends string> {
  readonly scoresheet: Readonly<Ref<Scoresheet<Schema> | undefined>>

  tally: (schema: Schema) => number
  addMark: (mark: MarkPayload<Schema | 'undo' | 'clear'>) => Promise<void> | void
  complete: () => Promise<void> | void
  open: (system: string, ...vendor: string[]) => Promise<void> | void
  close: (save?: boolean) => Promise<void> | void
}

const scoresheet = ref<Scoresheet<string>>()
const system = ref<'local' | 'rs' | 'servo'>()
const tally = ref<ScoreTally<string>>(reactive({}))
const ready = idbReady()
const { push: pushNotification } = useNotifications()

function processMark <Schema extends string> (tally: Ref<ScoreTally<Schema>>, mark: MarkPayload<Schema>, marks: Array<Mark<Schema>>) {
  try {
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
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

export function calculateTally <Schema extends string> (marks: Array<Mark<Schema>>) {
  const tally: Ref<ScoreTally<Schema>> = ref({})
  for (const mark of marks) processMark(tally, mark, marks)
  return tally.value
}

function addMark <Schema extends string> (mark: MarkPayload<Schema>) {
  try {
    const scsh = scoresheet.value
    if (!scsh) throw new Error('Scoresheet is not open')
    if (scsh.completedAt) throw new Error('Can\'t change completed scoresheet')

    if (scsh.options?.live === true || scsh.options?.deviceStream === true) {
      provideApolloClient(apolloClient)
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    scsh.marks.push({
      timestamp: Date.now(),
      sequence: scsh.marks.length,
      ...mark
    } as Mark<Schema>)

    processMark(tally, mark, scsh.marks)

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
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

/**
 * @param scoresheet Providing this value will adjust the timestamps on the
 *                   marks to be relative to scoresheet openedAt ?? createdAt
 */
export function convertMarksToServoIntermediate <Schema extends string> (_marks: Readonly<Array<Mark<Schema>>>, scoresheet?: ServoIntermediateScoresheet<Schema>) {
  // First we slice from the last clear mark removing the clear mark itself
  let marks = [..._marks]
  const lastClearIdx = _marks.findLastIndex(m => m.schema === 'clear')
  if (lastClearIdx > -1) {
    marks = marks.slice(lastClearIdx + 1)
  }

  // Then we process all the undo marks removing the undo target and the undo mark
  for (let idx = 0; idx < marks.length; idx++) {
    const mark = { ...marks[idx] }
    if (scoresheet != null) mark.timestamp = mark.timestamp - (scoresheet.openedAt ?? scoresheet.createdAt)
    if (isUndoMark(mark)) {
      const undoneMarkIdx = marks.findIndex(m => m.sequence === mark.target)
      if (undoneMarkIdx === -1) throw new Error('Undone mark missing')
      const undoneMark = marks[undoneMarkIdx]
      if (!isUndoMark(undoneMark) && !isClearMark(undoneMark)) {
        marks.splice(undoneMarkIdx, 1)
        idx--
      }
      marks.splice(idx, 1)
      idx--
    } else {
      marks.splice(idx, 1, mark)
    }
  }

  return marks as Array<Exclude<Mark<Schema>, UndoMark | ClearMark>>
}

const complete = () => {
  if (!scoresheet.value) {
    const err = new Error('Scoresheet is not open')
    console.error(err)
    pushNotification({ message: err.message, color: 'red' })
    return
  }
  if (scoresheet.value.completedAt != null) {
    console.warn('Scoresheet already completed, not marking completed')
    return
  }
  scoresheet.value.completedAt = Date.now()
}

interface CloseScoresheetOptions {
  save: boolean
}

const openLocal = async (id: string) => {
  try {
    await ready
    let loaded = await idbKeyval.get(id)
    if (!loaded) throw new Error('Local scoresheet not found')
    loaded = reactive(loaded)

    scoresheet.value = loaded
    system.value = 'local'
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

const closeLocal = async ({ save }: CloseScoresheetOptions) => {
  try {
    if (!scoresheet.value) {
      const err = new Error('Scoresheet is not open')
      console.error(err)
      pushNotification({ message: err.message, color: 'orange' })
      return
    }

    if (save && scoresheet.value.submittedAt == null) {
      if (scoresheet.value.completedAt) scoresheet.value.submittedAt = Date.now()
      await ready
      await idbKeyval.set(scoresheet.value.id, JSON.parse(JSON.stringify(scoresheet.value)))
    }
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

const openRs = async (groupId: string, entryId: string, scoresheetId: string) => {
  return await new Promise((resolve, reject) => {
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

const closeRs = async ({ save }: CloseScoresheetOptions) => {
  return await new Promise((resolve, reject) => {
    provideApolloClient(apolloClient)
    if (!scoresheet.value) {
      const err = new Error('Scoresheet is not open')
      console.error(err)
      pushNotification({ message: err.message, color: 'orange' })
      resolve(undefined)
      return
    }
    if (save && scoresheet.value.submittedAt == null) {
      // TODO: store local copy in case submit fails and need to resubmit
      const { mutate, onDone } = useSaveScoresheetMutation({})
      mutate({
        scoresheetId: scoresheet.value.id,
        marks: scoresheet.value.marks,
        completedAt: scoresheet.value.completedAt,
        programVersion: `@ropescore/app@${import.meta.env.VITE_COMMIT_REF?.toString() ?? 'dev'}`
      })

      onDone(res => {
        if (res.errors) reject(res.errors)
        resolve(undefined)
      })
    } else {
      resolve(undefined)
    }
  })
}

const openServo = async (competitionId: number, entryId: number, judgeSequence: number, scoresheetId: string) => {
  try {
    const { baseUrl, token } = useServoAuth()
    if (baseUrl.value == null || token.value == null) {
      const err = new Error('Not logged in')
      console.error(err)
      pushNotification({ message: err.message, color: 'red' })
      router.push({ path: '/servo/connect' })
      return
    }

    let loaded = await idbKeyval.get(`servo::${competitionId}::${entryId}::${judgeSequence}::${scoresheetId}`)
    if (!loaded) throw new Error('Servo scoresheet not found')
    loaded = reactive(loaded)

    scoresheet.value = loaded as ServoIntermediateScoresheet<string>
    system.value = 'servo'
    scoresheet.value.openedAt = Date.now()

    if (scoresheet.value.submittedAt == null) {
      const url = new URL(`/api/v1/Competitions/${competitionId}/Entries/${entryId}/Scores/${judgeSequence}/scoresheet-opened`, baseUrl.value)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token.value}`
        }
      })
      if (!response.ok) {
        const body = await response.text()
        console.error(new Error(`Request to ${url.href} failed with status code ${response.status} and body ${body}`))
        pushNotification({ message: body, color: 'orange' })
      }
    }
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

const closeServo = async ({ save }: CloseScoresheetOptions) => {
  try {
    const { baseUrl, token, deviceId } = useServoAuth()
    if (baseUrl.value == null || token.value == null) {
      const err = new Error('Not logged in')
      console.error(err)
      pushNotification({ message: err.message, color: 'red' })
      router.push({ path: '/servo/connect' })
      return
    }

    if (!scoresheet.value) {
      const err = new Error('Scoresheet is not open')
      console.error(err)
      pushNotification({ message: err.message, color: 'orange' })
      return
    }
    if (!isServoIntermediateScoresheet(scoresheet.value)) {
      throw new Error('Trying to save something that isn\'t a servo scoresheet')
    }
    const rulesId = scoresheet.value.rulesId
    const judgeType = scoresheet.value.judgeType
    const model = models.find(model => model.rulesId.includes(rulesId) && model.judgeType === judgeType)
    if (!model) {
      throw new Error('Could not find model for scoresheet')
    }
    if (model.converters?.servo == null) {
      throw new Error('Model does not have a converter for servo scoring')
    }
    const [,competitionId, entryId, judgeSequence] = scoresheet.value.id.split('::')

    if (save && scoresheet.value.submittedAt == null) {
      // Store the local copy
      await ready
      await idbKeyval.set(scoresheet.value.id, JSON.parse(JSON.stringify(scoresheet.value)))

      const battery = useBattery()

      const prevScoresheets = await getServoScoresheetsForEntry({ competitionId, entryId, judgeSequence })
      const rejump = prevScoresheets.length > 0 && prevScoresheets.some(scsh => scsh.submittedAt != null)

      let url: URL, method: string
      if (rejump) {
        url = new URL(`/api/v1/Competitions/${competitionId}/Entries/${entryId}/Scores/${judgeSequence}`, baseUrl.value)
        method = 'PUT'
      } else {
        url = new URL(`/api/v1/Competitions/${competitionId}/Entries/${entryId}/Scores`, baseUrl.value)
        method = 'POST'
      }

      const scores = model.converters.servo(scoresheet.value)

      // store the remote copy
      const response = await fetch(url, {
        method,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${token.value}`
        },
        body: JSON.stringify({
          ScoreSequence: parseInt(judgeSequence, 10),
          IsScored: false,
          JudgeScoreData: {
            Version: version,
            DeviceID: deviceId.value,
            RoutineStartTime: scoresheet.value.openedAt ?? scoresheet.value.createdAt,
            BatteryLevel: battery.isSupported ? Math.round(battery.level.value * 100) : undefined,
            ...scores
          }
        })
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(`Request to ${method} ${url.href} failed with status code ${response.status} and body ${body}`)
      }

      scoresheet.value.submittedAt = Date.now()
      await idbKeyval.set(scoresheet.value.id, JSON.parse(JSON.stringify(scoresheet.value)))
    }

    if (scoresheet.value.submittedAt == null) {
      const url = new URL(`/api/v1/Competitions/${competitionId}/Entries/${entryId}/Scores/${judgeSequence}/scoresheet-closed`, baseUrl.value)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token.value}`
        }
      })
      if (!response.ok) {
        const body = await response.text()
        console.error(new Error(`Request to ${url.href} failed with status code ${response.status} and body ${body}`))
        pushNotification({ message: body, color: 'orange' })
      }
    }
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

export function useScoresheet <Schema extends string> (): UseScoresheetReturn<Schema> {
  return {
    scoresheet: scoresheet as Ref<Scoresheet<Schema>>,
    tally: (schema) => tally.value[schema] ?? 0,

    addMark,
    complete,
    async open (system, ...vendor) {
      try {
        console.log('open called with system', system, 'and vendor parameters', vendor)
        switch (system) {
          case 'local':
            await openLocal(vendor[0])
            break
          case 'rs':
            await openRs(vendor[0], vendor[1], vendor[2])
            break
          case 'servo':
            await openServo(parseInt(vendor[0], 10), parseInt(vendor[1], 10), parseInt(vendor[2], 10), vendor[3])
            break
          default:
            throw new TypeError('Unknown system specified, cannot open scoresheet')
        }

        tally.value = reactive({})

        const marks = scoresheet.value?.marks ?? []

        for (const mark of marks) processMark(tally, mark, marks)
      } catch (err) {
        if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
        throw err
      }
    },
    async close (save: boolean = true) {
      try {
        if (!scoresheet.value) return

        switch (system.value) {
          case 'local':
            await closeLocal({ save })
            break
          case 'rs':
            await closeRs({ save })
            break
          case 'servo':
            await closeServo({ save })
            break
          default:
            throw new TypeError('Unknown system specified, cannot open scoresheet')
        }

        scoresheet.value = undefined
        system.value = undefined
        tally.value = reactive({})
      } catch (err) {
        if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
        throw err
      }
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

export interface CreateServoScoresheetArgs {
  competitionId: number
  entryId: number
  judgeSequence: number
  scoringModel: string
  competitionEventId: string
  options?: Record<string, any> | null
}
export async function createServoScoresheet ({ competitionId, entryId, judgeSequence, scoringModel, competitionEventId, options }: CreateServoScoresheetArgs) {
  try {
    let judgeType: string
    if (scoringModel.startsWith('ijru.freestyle.') || scoringModel.startsWith('ijru.teamshow.')) {
      if (judgeSequence >= 1 && judgeSequence <= 9) judgeType = 'Pa'
      else if (judgeSequence >= 11 && judgeSequence <= 19) judgeType = 'Pr'
      else if (judgeSequence >= 21 && judgeSequence <= 29) judgeType = 'R'
      else if (judgeSequence >= 31 && judgeSequence <= 39) judgeType = 'D'
      else throw new TypeError(`Invalid judge sequence ${judgeSequence} for scoring model ${scoringModel}`)
    } else if (scoringModel.startsWith('ijru.speed.')) {
      if (judgeSequence === 1) judgeType = 'Shj'
      else judgeType = 'S'
    } else if (scoringModel.startsWith('ijru.ddcf.') || scoringModel.startsWith('ijru.ddc.')) {
      switch (judgeSequence) {
        case 1:
        case 2:
          judgeType = 'J'
          break
        case 3:
        case 4:
          judgeType = 'T'
          break
        case 5:
        case 6:
        case 7:
          judgeType = 'E'
          break
        case 8:
        case 9:
        case 10:
          judgeType = 'S'
          break
        default:
          throw new TypeError(`Invalid judge sequence ${judgeSequence} for scoring model ${scoringModel}`)
      }
    } else {
      throw new TypeError(`scoring model ${scoringModel} not supported`)
    }

    const newScoresheet: ServoIntermediateScoresheet<string> = {
      id: `servo::${competitionId}::${entryId}::${judgeSequence}::${uuid()}`,
      marks: [],
      rulesId: scoringModel,
      judgeType,
      competitionEventId,
      options,
      createdAt: Date.now()
    }

    await idbKeyval.set(newScoresheet.id, newScoresheet)
    return newScoresheet.id
  } catch (err) {
    if (err instanceof Error) pushNotification({ message: err.message, color: 'red' })
    throw err
  }
}

export interface GetServoScoresheetsForEntry {
  competitionId: number | string
  entryId: number | string
  judgeSequence: number | string
}
export async function getServoScoresheetsForEntry ({ competitionId, entryId, judgeSequence }: GetServoScoresheetsForEntry) {
  const scoresheetIds = await idbKeyval.keys<string>()
  const prevScoresheetIds = scoresheetIds.filter(scshId => scshId.startsWith(`servo::${competitionId}::${entryId}::${judgeSequence}::`))
  const scoresheets: Array<ServoIntermediateScoresheet<string>> = await idbKeyval.getMany(prevScoresheetIds)
  return scoresheets
}
