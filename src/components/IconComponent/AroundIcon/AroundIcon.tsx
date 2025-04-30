import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface LoopIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const AroundIcon: FunctionalComponent<LoopIconProps> = ({
  width = 56,
  height = 56,
  scale = 1,
  color = '#ffffff',
  strokeWidth = 1,
  className = '',
}) => {
  const scaledWidth = typeof width === 'number' ? width * scale : width;
  const scaledHeight = typeof height === 'number' ? height * scale : height;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 25 25"
      class={`loop-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      style={{ rotate: '-84deg', flexShrink: 0 }}
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <g data-name="25" id="_25">
        <path d="M9.31,20.38a.5.5,0,0,0,.38-.93A7.5,7.5,0,0,1,12.28,5L11.15,6.15a.5.5,0,1,0,.71.71l2-2a.5.5,0,0,0,0-.71l-2-2a.5.5,0,0,0-.71.71L12.3,4a8.5,8.5,0,0,0-3,16.37Z" />
        <path d="M15.31,5.54A7.5,7.5,0,0,1,12.72,20l1.14-1.14a.5.5,0,0,0-.71-.71l-2,2a.5.5,0,0,0,0,.71l2,2a.5.5,0,0,0,.71-.71L12.7,21a8.5,8.5,0,0,0,3-16.37.5.5,0,1,0-.37.93Z" />
      </g>
    </svg>
  );
};
