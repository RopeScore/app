import store from './store'

navigator.getBattery?.().then(battery => {
  function updateAllBatteryInfo() {
    updateChargeInfo()
    updateLevelInfo()
  }
  updateAllBatteryInfo()

  battery.addEventListener('chargingchange', function () {
    updateChargeInfo()
  });
  function updateChargeInfo() {
    store.commit('setBatteryCharging', battery.charging)
  }

  battery.addEventListener('levelchange', function () {
    updateLevelInfo()
  });
  function updateLevelInfo() {
    store.commit('setBatteryLevel', battery.level)
  }
})
