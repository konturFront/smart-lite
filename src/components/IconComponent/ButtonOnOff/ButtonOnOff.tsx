import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface MutedSpeakerIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  className?: string;
}

export const ButtonOnOff: FunctionalComponent<MutedSpeakerIconProps> = ({
  width = 24,
  height = 24,
  scale = 1,
  color = '#ffffff',
  className = '',
}) => {
  const scaledWidth = typeof width === 'number' ? width * scale : width;
  const scaledHeight = typeof height === 'number' ? height * scale : height;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 187.6 188.6"
      class={`muted-speaker-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fill: color, flexShrink: 0 }}
    >
      <path d="M88,0h12.6v100.6H88V0z" />
      <path
        d="M136.8,10.5l-6.6,10.8c27.5,14,44.8,42.2,44.8,73c0,45.1-36.4,81.7-81.2,81.7s-81.2-36.7-81.2-81.7
        c0-28,14.3-54.1,37.9-69.1l8.7-5.8l-7.4-9.9l-8.6,5.4C16.2,32.3-0.1,62.2,0,94.3c0,52.1,42,94.3,93.8,94.3s93.8-42.2,93.8-94.3
        C187.6,59.1,168,26.8,136.8,10.5z"
      />
    </svg>
  );
};
