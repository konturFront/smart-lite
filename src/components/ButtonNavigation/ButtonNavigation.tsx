import { h } from 'preact';
import styles from './styles.module.scss';
import React from 'react';
import { LightBulbIcon } from '../IconComponent/LightBulbIcon/LightBulbIcon';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { state } from '../../store/initialState';
import { socketStatusEnum } from '../../store/types';
import { toastService } from '../Toast/Toast';

type ButtonProps = {
  text?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  lampVisible?: boolean;
  sx?: React.CSSProperties;
};

export const ButtonNavigation = ({
  text = 'Кнопка',
  onClick,
  sx,
  lampVisible = false,
}: ButtonProps) => {
  const { isMobile380, isMobile360, isMobile340 } = useDeviceDetect();

  return (
    <div
      className={styles.btn}
      style={{ ...sx }}
      id="device-btn-update"
      onClick={event => {
        if (state.value.socketStatus !== socketStatusEnum.CONNECTED) {
          toastService.showError('Нет связи с мастером');
        } else {
          onClick?.(event);
        }
      }}
    >
      <span style={{ visibility: lampVisible ? 'hidden' : 'visible' }}> {`${text}`}</span>
      {lampVisible && (
        <div className={styles.lampWrapper}>
          <LightBulbIcon animateStripes={true} animationSpeed={1000} />
        </div>
      )}
    </div>
  );
};
