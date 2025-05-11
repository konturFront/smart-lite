import { socketService } from '../service/ws/socketService';

import { toastService } from '../components/Toast/Toast';
import { RoomsArr, socketStatusEnum } from './types';
import { state, stateUI } from './initialState';

const timers: Record<
  | 'findDriver'
  | 'updateDrivers'
  | 'saveDrivers'
  | 'saveSettingsDriver'
  | 'startTestDriver'
  | 'saveWIFI'
  | 'scanWIFI'
  | string,
  number
> = {
  findDriver: null,
  updateDrivers: null,
  saveDrivers: null,
  saveSettingsDriver: null,
  startTestDriver: null,
  saveWIFI: null,
  scanWIFI: null,
};
const retryCounts: Record<
  | 'updateDrivers'
  | 'saveDrivers'
  | 'saveSettingsDriver'
  | 'startTestDriver'
  | 'saveWIFI'
  | 'scanWIFI'
  | string,
  number
> = {
  updateDrivers: 0,
  saveDrivers: 0,
  saveSettingsDriver: 0,
  startTestDriver: 0,
  saveWIFI: 0,
  scanWIFI: 0,
};
// Методы обновления состояния

// Реконнетк для изменения урла для сокета
export const reconnectWS = (url: string) => {
  socketService.reconnect(url);
};
// Метод для появляется лоадинг в шапке
export const showLoadingStateUI = () => {
  stateUI.value = { ...stateUI.value, isLoadingUI: true };
};

export const findDeepDrivers = () => {
  if (timers.findDriver !== null) {
    clearTimeout(timers.findDriver);
    timers.findDriver = null;
  }

  showLoadingStateUI();
  socketService.send({ driver: 'find', cmd: 'start' });

  timers.findDriver = window.setTimeout(() => {
    toastService.showError('Нет связи с мастером');
    hiddenLoadingStateUI();
    timers.findDriver = null;
  }, 5 * 60000);
};

export function updateDriversWithRetry() {
  if (timers.updateDrivers) {
    clearTimeout(timers.updateDrivers);
    timers.updateDrivers = null;
  }
  // Инициализируем счётчик, если первый вызов
  retryCounts.updateDrivers = retryCounts.updateDrivers == null ? 0 : retryCounts.updateDrivers;

  // Шаг 1: отобразить лоадер и отправить команду
  showLoadingStateUI();
  socketService.send({ driver: 'update', cmd: 'start' });

  // Шаг 2: поставить таймер на RETRY_DELAY_MS
  timers.updateDrivers = window.setTimeout(() => {
    // Если пришёл ответ и список драйверов изменился,
    // то мы сбросим и таймер, и счётчик в onMessage (см. ниже).
    // Если же за 30 сек изменений не было — retryCounts[key] увеличится
    if (retryCounts.updateDrivers < 1) {
      retryCounts.updateDrivers = retryCounts.updateDrivers + 1;
      updateDriversWithRetry(); // перезапускаем заново
    } else {
      // окончательный провал
      toastService.showError('Нет связи с мастером при обновлении');
      hiddenLoadingStateUI();
      clearTimeout(timers.updateDrivers);
      timers.updateDrivers = null;
      retryCounts.updateDrivers = 0;
    }
  }, 30000);
}

export function saveDriversWithRetry(data: any) {
  if (timers.saveDrivers) {
    clearTimeout(timers.saveDrivers);
    timers.saveDrivers = null;
  }
  // Инициализируем счётчик, если первый вызов
  retryCounts.saveDrivers = retryCounts.saveDrivers == null ? 0 : retryCounts.saveDrivers;

  // Шаг 1: отобразить лоадер и отправить команду
  showLoadingStateUI();
  socketService.send({ ...data });

  // Шаг 2: поставить таймер на RETRY_DELAY_MS
  timers.saveDrivers = window.setTimeout(() => {
    // Если пришёл ответ и список драйверов изменился,
    // то мы сбросим и таймер, и счётчик в onMessage (см. ниже).
    // Если же за 30 сек изменений не было — retryCounts[key] увеличится
    if (retryCounts.saveDrivers < 1) {
      retryCounts.saveDrivers = retryCounts.saveDrivers + 1;
      saveDriversWithRetry(data); // перезапускаем заново
    } else {
      // окончательный провал
      toastService.showError('Нет связи с мастером при сохранении');
      hiddenLoadingStateUI();
      clearTimeout(timers.saveDrivers);
      timers.saveDrivers = null;
      retryCounts.saveDrivers = 0;
    }
  }, 10000);
}

export function updateSettingsDriverWithRetry(data: any) {
  const key = 'saveSettingsDriver';
  if (timers[key]) {
    clearTimeout(timers[key]);
    timers[key] = null;
  }
  retryCounts[key] = retryCounts[key] == null ? 0 : retryCounts[key];

  showLoadingStateUI();
  socketService.send({ ...data });

  timers[key] = window.setTimeout(() => {
    if (retryCounts[key] < 1) {
      retryCounts[key] = retryCounts[key] + 1;
      updateSettingsDriverWithRetry(data); // перезапускаем заново
    } else {
      // окончательный провал
      toastService.showError('Нет связи при обновлении драйвера');
      hiddenLoadingStateUI();
      clearTimeout(timers[key]);
      timers[key] = null;
      retryCounts[key] = 0;
    }
  }, 10000);
}

export function startTestDriverWithRetry(data: any) {
  if (data.cmd === 'stop') {
    socketService.send({ ...data });
    clearTimeout(timers.startTestDriver);
    timers.startTestDriver = null;
    retryCounts.startTestDriver = 0;
    // toastService.showSuccess('Тестирование драйвера');
    setTestingDriverAddress();
    return;
  }
  const key = 'startTestDriver';
  if (timers[key]) {
    clearTimeout(timers[key]);
    timers[key] = null;
  }
  // Инициализируем счётчик, если первый вызов
  retryCounts[key] = retryCounts[key] == null ? 0 : retryCounts[key];

  // Шаг 1: отобразить лоадер и отправить команду
  socketService.send({ ...data });

  timers[key] = window.setTimeout(() => {
    if (retryCounts[key] < 1) {
      retryCounts[key] = retryCounts[key] + 1;
      startTestDriverWithRetry(data);
    } else {
      toastService.showError('Нет связи при тестировании драйвера');
      hiddenLoadingStateUI();
      clearTimeout(timers[key]);
      timers[key] = null;
      retryCounts[key] = 0;
    }
  }, 10000);
}

export function saveWIFIWithRetry(data: any) {
  showLoadingStateUI();
  const key = 'saveWIFI';
  if (timers[key]) {
    clearTimeout(timers[key]);
    timers[key] = null;
  }
  // Инициализируем счётчик, если первый вызов
  retryCounts[key] = retryCounts[key] == null ? 0 : retryCounts[key];

  // Шаг 1: отобразить лоадер и отправить команду
  socketService.send({ ...data });

  timers[key] = window.setTimeout(() => {
    if (retryCounts[key] < 1) {
      retryCounts[key] = retryCounts[key] + 1;
      saveWIFIWithRetry(data);
    } else {
      toastService.showError('Нет связи при сохранеии WiFi настроек');
      hiddenLoadingStateUI();
      clearTimeout(timers[key]);
      timers[key] = null;
      retryCounts[key] = 0;
    }
  }, 10000);
}

export function scanWIFIWithRetry(data: any) {
  showLoadingStateUI();
  const key = 'scanWIFI';
  if (timers[key]) {
    clearTimeout(timers[key]);
    timers[key] = null;
  }
  // Инициализируем счётчик, если первый вызов
  retryCounts[key] = retryCounts[key] == null ? 0 : retryCounts[key];

  // Шаг 1: отобразить лоадер и отправить команду
  socketService.send({ ...data });

  timers[key] = window.setTimeout(() => {
    if (retryCounts[key] < 1) {
      retryCounts[key] = retryCounts[key] + 1;
      scanWIFIWithRetry(data);
    } else {
      toastService.showError('Нет связи при сохранеии WiFi настроек');
      hiddenLoadingStateUI();
      clearTimeout(timers[key]);
      timers[key] = null;
      retryCounts[key] = 0;
    }
  }, 10000);
}

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

// ЛОВИМ ===============================================================================================
socketService.onMessage(data => {
  // hiddenLoadingStateUI();
  console.log('onMessage', data);

  if (data.driver === 'find' && data.cmd === 'stop') {
    if (timers.findDriver !== null) {
      clearTimeout(timers.findDriver);
      timers.findDriver = null;
    }
    toastService.showSuccess(`Найдено драйверов: ${data.count}`);
    state.value = { ...state.value, countDrivers: data.count ?? 0 };
    updateDriversWithRetry();
  }

  //Пакет данных, передаваемый по окончании процедуры «обновления» драйверов (server->client):
  if (data.driver === 'update' && data.count !== undefined) {
    if (timers.updateDrivers) {
      clearTimeout(timers.updateDrivers);
      timers.updateDrivers = null;
    }
    retryCounts.updateDrivers = 0;

    state.value = { ...state.value, updatedDevices: data.drivers };
    toastService.showSuccess(`Драйверы обновлены`);
    hiddenLoadingStateUI();
  }

  // Тестирование драйвеа
  if (
    data.driver === 'test' &&
    (data.cmd === 'on' || data.cmd === 'off') &&
    data.addres !== undefined
  ) {
    clearTimeout(timers.startTestDriver);
    timers.startTestDriver = null;
    retryCounts.startTestDriver = 0;
    // toastService.showSuccess('Тестирование драйвера');
    state.value = { ...state.value, testingDriverAddress: data.addres };
  }

  // Тестирование остановка драйвера
  if (data.driver === 'test' && data.cmd === 'stop') {
    clearTimeout(timers.startTestDriver);
    timers.startTestDriver = null;
    retryCounts.startTestDriver = 0;
    // toastService.showSuccess('Тестирование остановлено');
    setTestingDriverAddress();
  }

  //Обновление настроке внутри драйвера
  if (data.driver === 'settyngs' && data.cmd === 'download' && Array.isArray(data.dr_settyngs)) {
    clearTimeout(timers.saveSettingsDriver);
    timers.saveSettingsDriver = null;
    retryCounts.saveSettingsDriver = 0;
    toastService.showSuccess('Настройки обновлены');
    state.value = { ...state.value, settingsDriver: data.dr_settyngs };
    hiddenLoadingStateUI();
  }

  if (data.driver === 'settyngs' && data.cmd === 'save' && data.state === 'ok') {
    clearTimeout(timers.saveDrivers);
    timers.saveDrivers = null;
    retryCounts.saveDrivers = 0;
    hiddenLoadingStateUI();
    toastService.showSuccess('Настройки сохранены');
    hiddenLoadingStateUI();
  }

  // Ответное сообщение о перезагрузке «Мастера» (server->client):
  if (data.master === 'reset' && data.cmd === 'ok') {
    hiddenLoadingStateUI();
  }

  // Ответное сообщение о сохранении настроек Wi-Fi (server->client):
  if (data.master === 'net' && data.cmd === 'ok') {
    clearTimeout(timers.saveWIFI);
    timers.saveWIFI = null;
    retryCounts.saveWIFI = 0;
    toastService.showSuccess('Настройки WiFi сохранены');
    hiddenLoadingStateUI();
  }
  // Ответное сообщение после сканирования сетей Wi-Fi (server->client):
  if (data.master === 'scan' && data.cmd === 'stop' && Array.isArray(data.ssid)) {
    setWifiNetworks(data.ssid);
    clearTimeout(timers.scanWIFI);
    timers.scanWIFI = null;
    retryCounts.scanWIFI = 0;
    toastService.showSuccess('SSID получены');
    hiddenLoadingStateUI();
  }
  // Ответное сообщение после запроса на получение комнат с драйверами
  if (data.rooms === 'search' && data.cmd === 'download') {
    setRooms(data.roomsArr);
    hiddenLoadingStateUI();
  }
});

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
