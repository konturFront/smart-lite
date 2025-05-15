// Начальное состояние
import { signal } from '@preact/signals';
import { AppState, IStateUI, socketStatusEnum } from './types';

export const state = signal<AppState>({
  socketURL: window.location.hostname,
  socketStatus: socketStatusEnum.DISCONNECTED,
  wifiNetworks: [],
  settingsDriver: [],
  updatedDevices: {},
  rooms: [],
  groups: Array(16).fill(false),
  countDrivers: undefined,
  testingDriverAddress: undefined,
  stateBus: undefined,
  isSearchDeepDrivers: false,
});
export const stateUI = signal<IStateUI>({ isActiveMenu: false, isLoadingUI: false });
