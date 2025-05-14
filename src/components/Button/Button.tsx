import { h } from 'preact';
import styles from './styles.module.scss';
import React from 'react';
import { LightBulbIcon } from '../IconComponent/LightBulbIcon/LightBulbIcon';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

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

export const Button = ({
  text = 'Кнопка',
  onClick,
  sx,
  lampVisible = false,
  disabled = false,
}: ButtonProps) => {
  const { isMobile380, isMobile360, isMobile340 } = useDeviceDetect();
  const size = () => {
    if (isMobile340) {
      return 28;
    }
    if (isMobile360) {
      return 30;
    }
    if (isMobile380) {
      return 36;
    }
    return 36;
  };
  return (
    <div
      className={styles.btn}
      style={{ ...sx }}
      id="device-btn-update"
      onClick={event => {
        if (!disabled) {
          onClick?.(event);
        }
      }}
    >
      <span style={{ visibility: lampVisible ? 'hidden' : 'visible' }}> {`${text}`}</span>
      {lampVisible && (
        <div className={styles.lampWrapper}>
          <LightBulbIcon
            animateStripes={true}
            height={size()}
            width={size()}
            animationSpeed={1000}
          />
        </div>
      )}
    </div>
  );
};
