import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface InfoIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const InfoIcon: FunctionalComponent<InfoIconProps> = ({
  width = 24,
  height = 24,
  scale = 1,
  color = '#ffffff',
  backgroundColor = '#141414',
  className = '',
}) => {
  const scaledWidth = typeof width === 'number' ? width * scale : width;
  const scaledHeight = typeof height === 'number' ? height * scale : height;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 439.488 443.88"
      class={`info-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Внешний круг (фон) */}
      <path
        d="M219.744 443.88C341.103 443.88 439.488 344.51 439.488 221.94C439.488 99.368 341.103 0 219.744 0C98.387 0 0 99.368 0 221.94C0 344.51 98.387 443.88 219.744 443.88z"
        fill={color}
      />

      {/* Внутренний круг */}
      <path
        d="M219.744 392.714C313.128 392.714 388.83 316.255 388.83 221.94C388.83 127.623 313.128 51.166 219.744 51.166C126.362 51.166 50.659 127.623 50.659 221.94C50.659 316.255 126.362 392.714 219.744 392.714z"
        fill={backgroundColor}
      />

      {/* Значок "i" (информация) */}
      <path
        d="M196.963 300.274L246.494 300.172L246.494 261.69C246.494 251.252 251.36 241.39 264.38 232.849C277.399 224.312 313.744 206.988 313.744 161.44C313.744 115.89 275.577 84.582 243.494 77.94C211.416 71.298 176.659 75.668 151.994 102.69C129.907 126.887 125.253 146.027 125.253 188.255L174.744 188.255L174.744 178.44C174.744 155.939 177.347 132.186 209.494 125.69C227.04 122.144 243.488 127.648 253.244 137.19C264.404 148.102 264.494 172.69 246.711 184.933L218.815 203.912C202.543 214.35 196.963 225.971 196.963 243.051L196.963 300.274z"
        fill={color}
      />

      {/* Точка под "i" */}
      <path
        d="M196.638 370.692L196.638 319.687L246.85 319.687L246.85 370.692L196.638 370.692z"
        fill={color}
      />
    </svg>
  );
};
