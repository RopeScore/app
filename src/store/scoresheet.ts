import { Module } from 'vuex'
import { v4 as uuid } from 'uuid'
import { get, set, keys, clear } from 'idb-keyval'
import { RootState } from '../store'
import idbReady from 'safari-14-idb-fix'

import type { schemas as ijru_1_1_0_diff_schemas } from '../views/scoring/ijru@1.1.0/Difficulty.vue'
import type { schemas as ijru_1_1_0_speed_schemas } from '../views/scoring/ijru@1.1.0/Speed.vue'
import type { schemas as ijru_2_0_0_ath_pres_schemas } from '../views/scoring/ijru@2.0.0/AthletePresentation.vue'
import type { schemas as ijru_2_0_0_rout_pres_schemas } from '../views/scoring/ijru@2.0.0/RoutinePresentation.vue'
import type { schemas as ijru_2_0_0_req_el_schemas } from '../views/scoring/ijru@2.0.0/RequiredElements.vue'

export type schemas = ijru_1_1_0_diff_schemas | ijru_1_1_0_speed_schemas
| ijru_2_0_0_ath_pres_schemas | ijru_2_0_0_rout_pres_schemas
| ijru_2_0_0_req_el_schemas

export interface GenericMark {
  readonly timestamp: number
  readonly sequence: number // should always === index
  readonly schema: schemas
}

export interface UndoMark {
  readonly timestamp: number
  readonly sequence: number
  readonly schema: 'undo'
  readonly target: number
}

export type Mark = GenericMark | UndoMark

export type MarkPayload = { schema: 'undo', target: number } | { schema: schemas }

export type ScoreTally = Partial<Record<keyof schemas, number>>

export interface LocalScoresheet {
  id: string

  competitionEventLookupCode: string
  rulesId: string
  judgeType: string

  marks: Mark[]

  openedAt?: number
  completedAt?: number
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

  // information about the assignment / group of scoresheets
  deviceId: string

  // stuff for display
  participantName: string
  judgeName: string
  categoryName: string

  // some metadata
  createdAt: number // server
  updatedAt: number // server
  submittedAt?: number // server
  openedAt?: number // app
  completedAt?: number // app
  didNotSkip: boolean
  heat: number

  // optional feature toggles
  options?: Object

  marks: Mark[]
}

export type Scoresheet = RemoteScoresheet | LocalScoresheet

export interface ScoresheetState {
  currentScoresheet: Scoresheet | null
  tally: ScoreTally
}

const ready = idbReady()

const scoresheetModule: Module<ScoresheetState, RootState> = {
  state: () => ({
    currentScoresheet: null,
    tally: {}
  }),
  getters: {
    currentScoresheet (state) {
      return state.currentScoresheet
    },
    tally (state) {
      return (prop: keyof schemas) => state.tally[prop] ?? 0
    }
  },
  mutations: {
    setCurrentScoresheet (state, scoresheet: Scoresheet | null) {
      if (scoresheet !== null && !scoresheet.openedAt) scoresheet.openedAt = Date.now()
      state.currentScoresheet = scoresheet
      state.tally = {}
    },
    completeOpenScoresheet (state) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      state.currentScoresheet.completedAt = Date.now()
    },
    addMark (state, mark: MarkPayload) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      if (state.currentScoresheet.completedAt) throw Error('Can\'t change completed scoresheet')
      const tsMark: Mark = {
        timestamp: Date.now(),
        sequence: state.currentScoresheet.marks.length,
        ...mark
      }
      state.currentScoresheet.marks.push(tsMark)
    },

    incrementTally (state, schema: keyof schemas) {
      state.tally[schema] = (state.tally[schema] ?? 0) + 1
    },
    decrementTally (state, schema: keyof schemas) {
      state.tally[schema] = (state.tally[schema] ?? 0) - 1
    }
  },
  actions: {
    async createLocalScoresheet (_, { judgeType, rulesId, competitionEventLookupCode }) {
      const newScoresheet: LocalScoresheet = {
        id: uuid(),
        judgeType,
        rulesId,
        competitionEventLookupCode: competitionEventLookupCode ?? '',
        marks: []
      }

      await set(newScoresheet.id, newScoresheet)
      return newScoresheet.id
    },
    async openScoresheet ({ commit, state, dispatch }, id: string) {
      if (id === state.currentScoresheet?.id) return
      await ready
      const scoresheet = await get(id)
      if (!scoresheet) throw Error('No such scoresheet in idb')
      if (state.currentScoresheet) await dispatch('saveCurrentScoresheet')

      console.log('Setting new current scoresheet')
      commit('setCurrentScoresheet', scoresheet)
    },
    async saveCurrentScoresheet ({ state }) {
      if (!state.currentScoresheet) throw Error('No scoresheet open')
      console.log('Saving current scoresheet')
      await ready
      await set(state.currentScoresheet.id, JSON.parse(JSON.stringify(state.currentScoresheet)))
    },
    async listScoresheets () {
      await ready
      return keys()
    },
    async removeAllScoresheets () {
      await ready
      return clear()
    },
    addMark ({ commit, state }, mark: MarkPayload) {
      commit('addMark', mark)

      if (mark.schema === 'undo') {
        const undoneMark = state.currentScoresheet?.marks[mark.target]
        if (!undoneMark) throw new Error('Undone mark missing')
        commit('decrementTally', undoneMark.schema)
      } else {
        commit('incrementTally', mark.schema)
      }
    }
  }
}

export default scoresheetModule
