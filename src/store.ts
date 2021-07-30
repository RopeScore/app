import { createStore } from 'vuex'
import scoresheetModule, { ScoresheetState } from './store/scoresheet'

export interface RootState {
  scoresheet: ScoresheetState
}

export default createStore<RootState>({
  modules: {
    scoresheet: scoresheetModule
  }
})
