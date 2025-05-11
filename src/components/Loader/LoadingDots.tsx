import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export function LoadingDots() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev % 3) + 1); // Цикл 1 → 2 → 3 → 1...
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        paddingRight: '1px',
        fontSize: '18px',
      }}
    >
      Подождите
      <span
        style={{
          position: 'absolute',
          left: '100%',
          top: 0,
          marginLeft: '4px',
        }}
      >
        {'.'.repeat(dots)}
      </span>
    </div>
  );
}
