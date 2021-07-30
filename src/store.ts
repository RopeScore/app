import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import scoresheetModule, { ScoresheetState } from './store/scoresheet'

export interface RootState {
  scoresheet: ScoresheetState,
}

export default  createStore<RootState>({
  plugins: [createPersistedState({ paths: ['settings'] })],
  modules: {
    scoresheet: scoresheetModule,
  }
})
