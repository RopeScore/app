import { Module } from "vuex"
import { v4 as uuid } from 'uuid'
import { get, set, keys, clear } from 'idb-keyval'
import { RootState } from "../store"

interface Mark {
  timestamp: number
  fieldId: string
  value: number
}

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

  // optional feature toggles
  options?: Object

  marks: Mark[]
}

export type Scoresheet = RemoteScoresheet | LocalScoresheet

export interface ScoresheetState {
  currentScoresheet: Scoresheet | null
}

const scoresheetModule: Module<ScoresheetState, RootState> = {
  state: () => ({
    currentScoresheet: null
  }),
  getters: {
    currentScoresheet (state) {
      return state.currentScoresheet
    }
  },
  mutations: {
    setCurrentScoresheet(state, scoresheet: Scoresheet | null) {
      if (scoresheet !== null && !scoresheet.openedAt) scoresheet.openedAt = Date.now()
      state.currentScoresheet = scoresheet
    },
    completeOpenScoresheet(state) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      state.currentScoresheet.completedAt = Date.now()
    },
    addMark(state, mark: Omit<Mark, 'timestamp'>) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      const tsMark = mark as Mark
      tsMark.timestamp = Date.now()
      state.currentScoresheet.marks.push(tsMark)
    },
  },
  actions: {
    async createLocalScoresheet({ commit }, { judgeType, rulesId, competitionEventLookupCode }) {
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
    async openScoresheet({ commit, state, dispatch }, id: string) {
      if (id === state.currentScoresheet?.id) return
      let scoresheet = await get(id)
      if (!scoresheet) throw Error('No such scoresheet in idb')
      if (state.currentScoresheet) await dispatch('saveCurrentScoresheet')

      console.log('Setting new current scoresheet')
      commit('setCurrentScoresheet', scoresheet)
    },
    async saveCurrentScoresheet({ state }) {
      if (!state.currentScoresheet) throw Error('No scoresheet open')
      console.log('Saving current scoresheet')
      await set(state.currentScoresheet.id, JSON.parse(JSON.stringify(state.currentScoresheet)))
    },
    listScoresheets() {
      return keys()
    },
    removeAllScoresheets() {
      return clear()
    }
  }
}

export default scoresheetModule
