import { h } from 'preact';

export const Rele = ({ size = 100, color = '#fef7cb', strokeWidth = 2 }) => {
  return (
    <svg
      width={size}
      height={(size * 56) / 100}
      viewBox="0 0 100 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={color} stroke-width={strokeWidth} stroke-linecap="round" fill="none">
        <line x1="2" y1="35" x2="30" y2="35" />
        <line x1="30" y1="35" x2="50" y2="17" />
        <line x1="56" y1="35" x2="95" y2="35" />
      </g>
    </svg>
  );
};
