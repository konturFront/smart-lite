import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface DoubleArrowIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  gap?: number; // Расстояние между стрелками
}

export const DoubleArrowIcon: FunctionalComponent<DoubleArrowIconProps> = ({
  width = 32,
  height = 32,
  scale = 1,
  color = '#ffffff',
  className = '',
  direction = 'right',
  gap = 8, // Значение по умолчанию для расстояния между стрелками
}) => {
  const scaledWidth = typeof width === 'number' ? width * scale : width;
  const scaledHeight = typeof height === 'number' ? height * scale : height;
  const scaledGap = typeof gap === 'number' ? gap * scale : gap;

  // Стиль для разворота стрелки
  const transformStyle = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

  // SVG path из вашего примера
  const arrowPath = 'M62.8,188.6L14.1,94.3L62.8,0h-14L0,94.3l48.7,94.3H62.8z';

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 125.6 188.6" // Ширина = 62.8 * 2 + gap
      class={`double-arrow-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: transformStyle, transformOrigin: 'center' }}
    >
      <defs>
        <style>{`.cls-1{fill:${color};}`}</style>
      </defs>

      {/* Первая стрелка */}
      <path class="cls-1" d={arrowPath} transform="translate(0,0)" />

      {/* Вторая стрелка с отступом */}
      <path class="cls-1" d={arrowPath} transform={`translate(${62.8 + scaledGap},0)`} />
    </svg>
  );
};
