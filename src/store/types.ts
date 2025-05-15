export enum socketStatusEnum {
  PENDING = 'pending',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}
export type Room = {
  idRoom: string;
  roomName: string;
  drivers: Record<string, number[]>;
  groups?: {
    idGroup: string;
    groupName: string;
    driverAddresses?: Record<string, number[]>;
  }[];
};
export type RoomsArr = Room[];

// Тип для состояния устройства
export interface AppState {
  socketURL: string;
  socketStatus: socketStatusEnum;
  wifiNetworks: string[];
  groups: boolean[];
  updatedDevices: Record<string, string[]>;
  settingsDriver: number[];
  rooms: RoomsArr | [];
  countDrivers: string | number;
  onlineCountDrivers: unknown;
  testingDriverAddress: number | undefined;
  stateBus: number | undefined;
}

export interface IStateUI {
  isActiveMenu: boolean;
  isLoadingUI: boolean;
  isLoadingIntervalStatus: boolean;
}
