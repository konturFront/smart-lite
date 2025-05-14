import { JSX } from 'preact';
import styles from './styles.module.scss';
import { useEffect } from 'preact/hooks';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: JSX.Element | JSX.Element[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullScreen?: boolean;
  // Новые пропсы для управления кнопками
  buttonsType?: 'none' | 'single' | 'dual'; // 'none' - без кнопок, 'single' - одна, 'dual' - две
  singleButtonText?: string;
  singleButtonAction?: () => void;
  dualPrimaryButtonText?: string;
  dualPrimaryButtonAction?: () => void;
  dualSecondaryButtonText?: string;
  dualSecondaryButtonAction?: () => void;
  showCloseButton?: boolean; // Показывать ли кнопку закрытия
}

const widthMap = {
  xs: '360px',
  sm: '480px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
};

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'sm',
  fullWidth = false,
  fullScreen = false,
  buttonsType = 'none',
  singleButtonText = 'Понятно',
  singleButtonAction,
  dualPrimaryButtonText = 'Да',
  dualPrimaryButtonAction,
  dualSecondaryButtonText = 'Нет',
  dualSecondaryButtonAction,
  showCloseButton = true,
}: ModalProps) {
  // Закрытие по Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleSingleButtonClick = () => {
    singleButtonAction ? singleButtonAction() : onClose();
  };

  useEffect(() => {
    if (open) {
      // Блокируем прокрутку фона
      document.body.style.overflow = 'hidden';
    } else {
      // Возвращаем прокрутку
      document.body.style.overflow = '';
    }

    return () => {
      // Обязательно очищаем при размонтировании или переключении
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${fullScreen ? styles.fullScreen : ''}`}
        style={{
          maxWidth: fullScreen ? '100%' : fullWidth ? '100%' : widthMap[maxWidth],
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalContainer}>
          {showCloseButton && (
            <button className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          )}
          {children}

          {buttonsType !== 'none' && (
            <div className={styles.actions}>
              {buttonsType === 'dual' && (
                <>
                  <button
                    className={styles.buttonCancel}
                    onClick={dualSecondaryButtonAction || onClose}
                  >
                    {dualSecondaryButtonText}
                  </button>
                  <button className={styles.buttonConfirm} onClick={dualPrimaryButtonAction}>
                    {dualPrimaryButtonText}
                  </button>
                </>
              )}
              {buttonsType === 'single' && (
                <button
                  className={styles.buttonConfirm}
                  onClick={handleSingleButtonClick}
                  style={{ width: '100%' }}
                >
                  {singleButtonText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
