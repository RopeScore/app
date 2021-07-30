import { computed, reactive } from 'vue'

export interface BatteryState {
  charging: boolean
  batteryLevel: number | null
}

const battery = reactive<BatteryState>({
  charging: false,
  batteryLevel: null
})

navigator.getBattery?.().then(b => {
  function updateAllBatteryInfo () {
    updateChargeInfo()
    updateLevelInfo()
  }
  updateAllBatteryInfo()

  b.addEventListener('chargingchange', function () {
    updateChargeInfo()
  })
  function updateChargeInfo () {
    battery.charging = b.charging
  }

  b.addEventListener('levelchange', function () {
    updateLevelInfo()
  })
  function updateLevelInfo () {
    battery.batteryLevel = b.level
  }
})

export function useBattery () {
  return {
    battery,
    batteryLevel: computed(() => {
      if (!battery.batteryLevel) return ''
      return Math.round(battery.batteryLevel * 100).toString() + '%'
    })
  }
}
