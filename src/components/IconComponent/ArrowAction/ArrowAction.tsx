import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface ArrowIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  className?: string;
  direction?: 'left' | 'right'; // Новый пропс
}

export const ArrowIcon: FunctionalComponent<ArrowIconProps> = ({
  width = 32,
  height = 32,
  scale = 1,
  color = '#ffffff',
  className = '',
  direction = 'right', // Значение по умолчанию
}) => {
  const scaledWidth = typeof width === 'number' ? width * scale : width;
  const scaledHeight = typeof height === 'number' ? height * scale : height;

  // Стиль для разворота стрелки
  const transformStyle = direction === 'left' ? 'scaleX(-1)' : 'none';

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 32 32"
      class={`arrow-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: transformStyle, transformOrigin: 'center' }}
    >
      <defs>
        <style>{`.cls-1{fill:${color};}`}</style>
      </defs>
      <g data-name="Layer 2" id="Layer_2">
        <path
          class="cls-1"
          d="M15.12,15.53,25,5.66a1,1,0,0,1,1.41,1.41l-9.06,9.06,8.8,8.8a1,1,0,0,1,0,1.41h0a1,1,0,0,1-1.42,0l-9.61-9.61A.85.85,0,0,1,15.12,15.53Z"
        />
        <path
          class="cls-1"
          d="M5.54,15.53l9.88-9.87a1,1,0,1,1,1.41,1.41L7.77,16.13l8.8,8.8a1,1,0,0,1,0,1.41h0a1,1,0,0,1-1.41,0L5.54,16.73A.85.85,0,0,1,5.54,15.53Z"
        />
      </g>
    </svg>
  );
};
