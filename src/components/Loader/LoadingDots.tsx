import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export function LoadingDots() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev % 3) + 1); // Цикл 1 → 2 → 3 → 1...
    }, 500); // Скорость анимации (0.5 сек)

    return () => clearInterval(interval);
  }, []);

  return <div style={{ textAlign: 'left', width: '120px' }}>Подождите{'.'.repeat(dots)}</div>;
}
