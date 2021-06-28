interface NavigatorBatteryStatus {
  getBattery(): Promise<BatteryManager>;
}

interface BatteryManager extends BatteryManagerEventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

interface BatteryManagerEventTargetEventMap {
  chargingchange: Event;
  chargingtimechange: Event;
  dischargingtimechange: Event;
  levelchange: Event;
}

interface BatteryManagerEventTarget extends EventTarget {
  onchargingchange: (this: BatteryManager, ev: Event) => any;
  onlevelchange: (this: BatteryManager, ev: Event) => any;
  onchargingtimechange: (this: BatteryManager, ev: Event) => any;
  ondischargingtimechange: (this: BatteryManager, ev: Event) => any;
  addEventListener<K extends keyof BatteryManagerEventTargetEventMap>(type: K, listener: (this: BatteryManager, ev: BatteryManagerEventTargetEventMap[K]) => any, useCapture?: boolean): void;
}

interface Navigator extends NavigatorBatteryStatus { }
