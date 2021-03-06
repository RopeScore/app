import { Module } from "vuex";
import { RootState } from "../store";

interface DeviceState {
  charging: boolean
  batteryLevel: number | null
}

const deviceModule: Module<DeviceState, RootState> = {
  state: () => ({
    charging: false,
    batteryLevel: null
  }),
  mutations: {
    setBatteryCharging (state, payload: boolean) {
      state.charging = payload
    },
    setBatteryLevel (state, payload: number) {
      state.batteryLevel = payload
    }
  }
}

export default deviceModule
