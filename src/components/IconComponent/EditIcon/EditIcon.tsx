import { h } from 'preact';
import type { FunctionalComponent } from 'preact';

interface EditIconProps {
  width?: number | string;
  height?: number | string;
  scale?: number;
  color?: string;
  className?: string;
}

export const EditIcon: FunctionalComponent<EditIconProps> = ({
  width = 18,
  height = 18,
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
      viewBox="0 0 18 18"
      class={`edit-icon ${className}`} // Изменил className на class
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
        <g fill={color} transform="translate(-213.000000, -129.000000)">
          <g transform="translate(213.000000, 129.000000)">
            <path d="M0,14.2 L0,18 L3.8,18 L14.8,6.9 L11,3.1 L0,14.2 L0,14.2 Z M17.7,4 C18.1,3.6 18.1,3 17.7,2.6 L15.4,0.3 C15,-0.1 14.4,-0.1 14,0.3 L12.2,2.1 L16,5.9 L17.7,4 L17.7,4 Z" />
          </g>
        </g>
      </g>
    </svg>
  );
};
