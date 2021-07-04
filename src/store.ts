import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import deviceModule, { DeviceState } from './store/device'
import scoresheetModule, { ScoresheetState } from './store/scoresheet'
import settingsModule, { SettingsState } from './store/settings'

export interface RootState {
  scoresheet: ScoresheetState,
  settings: SettingsState,
  device: DeviceState
}

export default createStore<RootState>({
  plugins: [createPersistedState({ paths: ['settings'] })],
  modules: {
    scoresheet: scoresheetModule,
    settings: settingsModule,
    device: deviceModule
  }
})
