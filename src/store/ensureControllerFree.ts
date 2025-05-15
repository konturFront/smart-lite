//Фцнкция которая делает запросы проверки контролера прежде чем сделать запрос
import { socketService } from '../service/ws/socketService';
import { hiddenLoadingStateUI, scanWIFIWithRetry, showLoadingStateUI } from './store';
import { toastService } from '../components/Toast/Toast';
import { state } from './initialState';
import { socketStatusEnum } from './types';

//Главная функция
export function ensureControllerFree(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    let handled = false;

    // Таймаут на случай, если контроллер не ответит вовремя
    const timer = window.setTimeout(() => {
      if (!handled) {
        unsubscribe?.();
        reject(new Error('таймаут проверки мастера'));
      }
    }, timeoutMs);

    // Обработчик входящих сообщений
    const handler = (data: any) => {
      if (data === 'free') {
        clearTimeout(timer);
        unsubscribe?.();
        handled = true;
        data === 'free' ? resolve() : null;
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
        toastService.showError('Мастер занят, попробуйте чуть позже');
        console.log('Мастер не свободен для', fn.name, err);
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
      toastService.showError('Невозможно выполнить — мастер занят');
      console.warn('getStateBusWithCheck:', err);
    });
}
