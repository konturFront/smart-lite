import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface DoubleArrowIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  gap?: number;
  isOpen?: boolean;
  onClick?: () => void;
}

export const DoubleArrowTopIcon: FunctionalComponent<DoubleArrowIconProps> = ({
  width = 32,
  height = 32,
  color = '#ffffff',
  className = '',
  gap = 8,
  isOpen = false,
  onClick,
}) => {
  const arrowPath = 'M62.8,188.6L14.1,94.3L62.8,0h-14L0,94.3l48.7,94.3H62.8z';

  // Определяем направление на основе состояния isOpen
  // const directionTransform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  const directionTransform = isOpen ? 'rotate(90deg)' : 'rotate(270deg)';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-block',
        transition: 'transform 0.3s ease',
        transform: directionTransform,
        cursor: 'pointer',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 125.6 188.6"
        class={`double-arrow-icon ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }} // Убираем лишние пробелы
      >
        <defs>
          <style>{`.cls-1{fill:${color};}`}</style>
        </defs>
        <path class="cls-1" d={arrowPath} transform="translate(0,0)" />
        <path class="cls-1" d={arrowPath} transform={`translate(${62.8 + gap},0)`} />
      </svg>
    </div>
  );
};
