import { h } from 'preact';
import styles from './styles.module.scss';
import React from 'react';
import { LightBulbIcon } from '../LightBulbIcon/LightBulbIcon';

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

export const Button = ({ text = 'Кнопка', onClick, sx, lampVisible = false }: ButtonProps) => {
  return (
    <div
      className={styles.btn}
      style={{ ...sx }}
      id="device-btn-update"
      onClick={event => {
        onClick?.(event);
      }}
    >
      <span style={{ visibility: lampVisible ? 'hidden' : 'visible' }}> {`${text}`}</span>
      {lampVisible && (
        <div style={{ position: 'absolute', top: '0', left: '0', transform: 'translate(86%,6%)' }}>
          <LightBulbIcon animateStripes={true} height={36} width={36} animationSpeed={1000} />
        </div>
      )}
    </div>
  );
};
