// hooks/useDeviceDetect.js
import { useEffect, useState } from 'preact/hooks';

export function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobile1100, setIsMobile1100] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 599);
      setIsMobile1100(window.innerWidth <= 1100);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isMobile1100 };
}
