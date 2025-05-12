// файл: src/components/Toast/toast.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import styles from './styles.module.scss';

// Типы тостов
export type ToastType = 'success' | 'warning' | 'error';

// Интерфейс тоста
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Глобальный сигнал для списка тостов
export const toasts = signal<Toast[]>([]);

let idCounter = 0;

// Сервис для показа тостов разных типов
export class ToastService {
  private create(message: string, type: ToastType, duration = 3000) {
    const id = ++idCounter;
    toasts.value = [...toasts.value, { id, message, type }];
    setTimeout(() => this.hide(id), duration);
  }

  showSuccess(message: string, duration?: number) {
    this.create(message, 'success', duration);
  }

  showWarning(message: string, duration?: number) {
    this.create(message, 'warning', duration);
  }

  showError(message: string, duration?: number) {
    this.create(message, 'error', duration);
  }

  hide(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }
}

// Синглтон-сервис
export const toastService = new ToastService();

// Провайдер для рендера тостов
export const ToastProvider = () => {
  const [list, setList] = useState(toasts.value);

  useEffect(() => {
    const unsub = toasts.subscribe(updated => setList(updated));
    return unsub;
  }, []);

  return (
    <div className={styles.toastContainer}>
      {list.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
