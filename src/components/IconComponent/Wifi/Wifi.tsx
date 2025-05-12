import React from 'react';

interface WifiIconProps {
  size?: number | string;
  rate?: number; // Уровень сигнала от 0 до 4
}

export const WifiIcon: React.FC<WifiIconProps> = ({ size = 24, rate = 0 }) => {
  // Всегда показываем все уровни, но регулируем прозрачность
  const getOpacity = (level: number): number => {
    return level <= rate ? 1 : 0.1; // Доступные уровни - непрозрачные, остальные - полупрозрачные
  };

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="var(--green-color)" // Все элементы белые
    >
      <g>
        {/* Уровень 1 (самый слабый сигнал) */}
        <path
          d="M15.49,16.11a6.11,6.11,0,0,0-7,0l1.15,1.63a4.08,4.08,0,0,1,4.67,0Z"
          opacity={getOpacity(1)}
        />

        {/* Уровень 2 */}
        <path
          d="M17.82,12.87a10,10,0,0,0-11.63,0l1.17,1.62a8.11,8.11,0,0,1,9.29,0Z"
          opacity={getOpacity(2)}
        />

        {/* Уровень 3 */}
        <path
          d="M20.13,9.62a13.94,13.94,0,0,0-16.27,0L5,11.24a11.94,11.94,0,0,1,13.93,0Z"
          opacity={getOpacity(3)}
        />

        {/* Уровень 4 (самый сильный сигнал) */}
        <path
          d="M1.54,6.36,2.7,8A16,16,0,0,1,21.3,8l1.17-1.62a18,18,0,0,0-20.93,0Z"
          opacity={getOpacity(4)}
        />

        {/* Точка (всегда видима если есть хоть какой-то сигнал) */}
        {rate > 0 && <rect height="2" width="2" x="11" y="19" opacity={1} />}
      </g>
    </svg>
  );
};
