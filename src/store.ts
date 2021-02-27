import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { v4 as uuid } from 'uuid'

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
  scoresheets: Scoresheet[]
}

export default createStore<State>({
  plugins: [createPersistedState()],
  state: () => ({
    scoresheets: [],
    currentScoresheet: null
  }),
  mutations: {
    addScoresheet (state, scoresheet: Scoresheet) {
      state.scoresheets.push(scoresheet)
    },
    removeScoresheet (state, scoresheetId: string) {
      const idx = state.scoresheets.findIndex(scoresheet => scoresheet.id === scoresheetId)
      state.scoresheets.splice(idx, 1)
    },
    openScoresheet (state, scoresheetId: string) {
      const scoresheet = state.scoresheets.find(scoresheet => scoresheet.id === scoresheetId)
      if (!scoresheet) throw Error('Scoresheet not found')
      state.currentScoresheet = scoresheet
      state.currentScoresheet.openedAt = Date.now()
    },
    completeOpenScoresheet (state) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      state.currentScoresheet.completedAt = Date.now()
      state.currentScoresheet = null
    },
    addMark (state, mark: Omit<Mark, 'timestamp'>) {
      if (!state.currentScoresheet) throw Error('No current scoresheet')
      const tsMark = mark as Mark
      tsMark.timestamp = Date.now()
      state.currentScoresheet.marks.push(tsMark)
    },
    removeAllScoresheets (state) {
      state.scoresheets = []
    }
  },
  actions: {
    createLocalScoresheet({ commit }, { judgeType, rulesId, competitionEventLookupCode }) {
      const newScoresheet: LocalScoresheet = {
        id: uuid(),
        judgeType,
        rulesId,
        competitionEventLookupCode: competitionEventLookupCode ?? '',
        marks: []
      }

      commit('addScoresheet', newScoresheet)

      return newScoresheet.id
    }
  }
})
