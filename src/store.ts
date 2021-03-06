import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import deviceModule from './store/device'
import scoresheetModule from './store/scoresheet'
import settingsModule from './store/settings'

export interface RootState {}

export default createStore<RootState>({
  plugins: [createPersistedState({ paths: ['settings'] })],
  modules: {
    scoresheet: scoresheetModule,
    settings: settingsModule,
    device: deviceModule
  }
})
