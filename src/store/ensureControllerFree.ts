//Фцнкция которая делает запросы проверки контролера прежде чем сделать запрос
import { socketService } from '../service/ws/socketService';
import {
  getStateBusWithRetry,
  hiddenLoadingStateUI,
  scanWIFIWithRetry,
  showLoadingStateUI,
} from './store';
import { toastService } from '../components/Toast/Toast';
//Главная функция
export function ensureControllerFree(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    let handled = false;

    // Таймаут на случай, если контроллер не ответит вовремя
    const timer = window.setTimeout(() => {
      if (!handled) {
        unsubscribe?.();
        reject(new Error('таймаут проверки контроллера'));
      }
    }, timeoutMs);

    // Обработчик входящих сообщений
    const handler = (data: any) => {
      if (data === 'free') {
        console.log('Контролер free');
        clearTimeout(timer);
        unsubscribe?.();
        handled = true;
        data === 'free' ? resolve() : reject(new Error('контроллер занят'));
      }
      if (data === 'busy') {
        console.log('Контролер busy');
        clearTimeout(timer);
        unsubscribe?.();
        handled = true;
        data === 'busy' && reject(new Error('контроллер занят'));
      }
    };

    // Подписываемся и получаем функцию отписки
    const unsubscribe = socketService.onMessage(handler);

    // Запрашиваем статус контроллера
    socketService.send('status');
  });
}

/**
 * Декоратор, который обернёт любую функцию в предварительную проверку контроллера.
 * @param fn — исходная функция (например, getStateBusWithRetry)
 */
export function withControllerCheck<T extends (...args: any[]) => void>(fn: T): T {
  return ((...args: any[]) => {
    showLoadingStateUI();
    ensureControllerFree()
      .then(() => {
        fn(...args);
      })
      .catch(err => {
        hiddenLoadingStateUI();
        toastService.showError('Контроллер занят, попробуйте чуть позже');
        console.warn('Контроллер не свободен для', fn.name, err);
      });
  }) as T;
}

/**
 * Сначала проверяем, свободен ли контроллер,
 * а потом уже шлём запрос на состояние шины.
 */
export function scanWIFIWithCheck(data: any) {
  ensureControllerFree()
    .then(() => {
      // Всё ок — отправляем штатный запрос с retry
      scanWIFIWithRetry(data);
    })
    .catch(err => {
      // Контроллер занят или таймаут
      hiddenLoadingStateUI();
      toastService.showError('Невозможно выполнить — контроллер занят');
      console.warn('getStateBusWithCheck:', err);
    });
}
