import { createStore, Module } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { v4 as uuid } from 'uuid'
import { get, set, keys, clear } from 'idb-keyval'


interface Mark {
  timestamp: number
  fieldId: string
  value: number
}

interface LocalScoresheet {
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

type Scoresheet = RemoteScoresheet | LocalScoresheet

export interface State {
  currentScoresheet: Scoresheet | null
}

export interface SettingsState {
  vibrate: boolean
}

const settingsModule: Module<SettingsState, State> = {
  state: () => ({
    vibrate: true
  }),
  mutations: {
    setVibrate (state, payload: boolean) {
      state.vibrate = payload
    }
  }
}

export default createStore<State>({
  plugins: [createPersistedState({ paths: ['settings'] })],
  modules: {
    settings: settingsModule
  },
  state: () => ({
    currentScoresheet: null
  }),
  mutations: {
    setCurrentScoresheet(state, scoresheet: Scoresheet | null) {
      if (scoresheet !== null && !scoresheet.openedAt) scoresheet.openedAt = Date.now()
      state.currentScoresheet = scoresheet
    },
    completeOpenScoresheet (state) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      state.currentScoresheet.completedAt = Date.now()
    },
    addMark (state, mark: Omit<Mark, 'timestamp'>) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      const tsMark = mark as Mark
      tsMark.timestamp = Date.now()
      state.currentScoresheet.marks.push(tsMark)
    },
  },
  actions: {
    async createLocalScoresheet ({ commit }, { judgeType, rulesId, competitionEventLookupCode }) {
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
    async openScoresheet ({ commit, state }, id: string) {
      let scoresheet = await get(id)
      if (!scoresheet) throw Error('No such scoresheet in idb')
      if (state.currentScoresheet) {
        await set(state.currentScoresheet.id, JSON.parse(JSON.stringify(state.currentScoresheet)))
      }

      commit('setCurrentScoresheet', scoresheet)
    },
    async saveCurrentScoresheet ({ state }) {
      if (!state.currentScoresheet) throw Error('No such scoresheet in idb')
      await set(state.currentScoresheet.id, JSON.parse(JSON.stringify(state.currentScoresheet)))
    },
    listScoresheets () {
      return keys()
    },
    removeAllScoresheets () {
      return clear()
    }
  }
})
