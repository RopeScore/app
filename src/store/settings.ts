import { Module } from 'vuex'
import { RootState } from '../store'

export interface SettingsState {
  vibrate: boolean
}

const settingsModule: Module<SettingsState, RootState> = {
  state: () => ({
    vibrate: true
  }),
  mutations: {
    setVibrate(state, payload: boolean) {
      state.vibrate = payload
    }
  }
}

export default settingsModule
