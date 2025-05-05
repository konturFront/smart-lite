import { signal } from '@preact/signals';
import { socketService } from '../service/ws/socketService';
import { GLOBAL_WS_URL } from '../global/value';
import is from '@sindresorhus/is';
import nan = is.nan;
import { nanoid } from 'nanoid';

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
  testingDriverAddress: number | undefined;
}

export interface IStateUI {
  isActiveMenu: boolean;
  isLoadingUI: boolean;
}

// Начальное состояние
export const state = signal<AppState>({
  socketURL: GLOBAL_WS_URL,
  socketStatus: socketStatusEnum.DISCONNECTED,
  wifiNetworks: [],
  settingsDriver: [],
  updatedDevices: {},
  rooms: [],
  groups: Array(16).fill(false),
  countDrivers: undefined,
  testingDriverAddress: undefined,
});
export const stateUI = signal<IStateUI>({ isActiveMenu: false, isLoadingUI: false });

// Методы обновления состояния

// Реконнетк для изменения урла для сокета
export const reconnectWS = (url: string) => {
  socketService.reconnect(url);
};
// Метод для появляется лоадинг в шапке
export const showLoadingStateUI = () => {
  stateUI.value = { ...stateUI.value, isLoadingUI: true };
};

// Метод для добавления комнаты
// export const addRoom = (obj?: Room) => {
//   console.log('store');
//   state.value = {
//     ...state.value,
//     rooms: [...state.value.rooms, { ...obj }],
//   };
// };

// Метод для удаление комнаты
// export const deleteRoom = (idRoom: string) => {
//   console.log('store');
//   state.value = {
//     ...state.value,
//     rooms: [...state.value.rooms.filter(item => item.idRoom !== idRoom)],
//   };
// };

// Метод для добавление группы в текущую комнату
// export const addGroupItem = (idRoom: string, groupName: string) => {
//   const objGroup = {
//     idGroup: nanoid(),
//     groupName: groupName,
//     driverAddresses: {},
//   };
//
//   state.value = {
//     ...state.value,
//     rooms: state.value.rooms.map(room =>
//       room.idRoom === idRoom
//         ? {
//             ...room,
//             groups: [...(room.groups || []), objGroup],
//           }
//         : room
//     ),
//   };
// };

// Метод для редактирования группы в текущую комнату
// export const editGroupName = (idRoom: string, idGroup: string, newGroupName: string) => {
//   state.value = {
//     ...state.value,
//     rooms: state.value.rooms.map(room => {
//       if (room.idRoom !== idRoom) return room;
//
//       return {
//         ...room,
//         groups: (room.groups || []).map(group => {
//           if (group.idGroup !== idGroup) return group;
//
//           return {
//             ...group,
//             groupName: newGroupName,
//           };
//         }),
//       };
//     }),
//   };
// };
// Метод для удаление группы в текущую комнату
// export const deleteGroup = (idRoom: string, idGroup: string) => {
//   state.value = {
//     ...state.value,
//     rooms: state.value.rooms.map(room => {
//       if (room.idRoom !== idRoom) return room;
//
//       return {
//         ...room,
//         groups: (room.groups || []).filter(group => group.idGroup !== idGroup),
//       };
//     }),
//   };
// };

// Метод для скрытия лоадинг в шапке
export const hiddenLoadingStateUI = () => {
  stateUI.value = { ...stateUI.value, isLoadingUI: false };
};

export const setWifiNetworks = (networks: string[]) => {
  state.value = { ...state.value, wifiNetworks: networks };
};

export const setConnectionStatus = (status: socketStatusEnum) => {
  state.value = { ...state.value, socketStatus: status };
};
// Получение списка комнат с драйверами для страницы rooms
export const setRooms = (rooms: RoomsArr) => {
  state.value = { ...state.value, rooms: rooms };
};

// Cеттим тестируемый драйвер
export const setTestingDriverAddress = (testingDriverAddress?: number) => {
  state.value = { ...state.value, testingDriverAddress: testingDriverAddress };
};

// Пример инициализации сокета с подпиской
socketService.onStatus(status => {
  setConnectionStatus(status as socketStatusEnum);
});
// Отправка данных сокет с возмоностью выключить лоадинг
export const sendMessageSocket = (data: Record<string | number, unknown>, withLoading = true) => {
  withLoading && showLoadingStateUI();
  socketService.send(data);
};

//ЛОВИМ//////// ответы от сервера для стора, для локального состояния используй sendAndWaiFor Response
socketService.onMessage(data => {
  // hiddenLoadingStateUI();
  console.log('ловим', data);

  if (data.driver === 'find' && data.cmd === 'stop') {
    state.value = { ...state.value, countDrivers: data.count ?? 0 };
    hiddenLoadingStateUI();
  }

  //Пакет данных, передаваемый по окончании процедуры «обновления» драйверов (server->client):
  if (data.driver === 'update' && data.count !== undefined) {
    state.value = { ...state.value, updatedDevices: data.drivers };
    hiddenLoadingStateUI();
  }

  // driver: 'test', cmd: 'on', addres: this.testing не доделал
  if (data.driver === 'test' && data.cmd === 'on') {
    state.value = { ...state.value, testingDriverAddress: data.addres };
  }

  if (data.driver === 'settyngs' && data.cmd === 'download' && Array.isArray(data.dr_settyngs)) {
    state.value = { ...state.value, settingsDriver: data.dr_settyngs };
    hiddenLoadingStateUI();
  }

  if (data.driver === 'settyngs' && data.cmd === 'save' && data.state === 'ok') {
    hiddenLoadingStateUI();
  }

  // Ответное сообщение о перезагрузке «Мастера» (server->client):
  if (data.master === 'reset' && data.cmd === 'ok') {
    hiddenLoadingStateUI();
  }

  // Ответное сообщение о сохранении настроек Wi-Fi (server->client):
  if (data.master === 'net' && data.cmd === 'ok') {
    hiddenLoadingStateUI();
  }
  // Ответное сообщение после сканирования сетей Wi-Fi (server->client):
  if (data.master === 'scan' && data.cmd === 'stop' && Array.isArray(data.ssid)) {
    setWifiNetworks(data.ssid);
    hiddenLoadingStateUI();
  }
  // Ответное сообщение после запроса на получение комнат с драйверами
  if (data.rooms === 'search' && data.cmd === 'download') {
    setRooms(data.roomsArr);
    hiddenLoadingStateUI();
  }
});
