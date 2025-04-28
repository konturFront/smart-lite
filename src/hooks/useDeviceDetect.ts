// hooks/useDeviceDetect.js
import { useEffect, useState } from 'preact/hooks';

export function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobile1100, setIsMobile1100] = useState(false);
  const [isMobile380, setIsMobile380] = useState(false);
  const [isMobile360, setIsMobile360] = useState(false);
  const [isMobile340, setIsMobile340] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 599);
      setIsMobile1100(window.innerWidth <= 1100);
      setIsMobile380(window.innerWidth <= 380);
      setIsMobile360(window.innerWidth <= 360);
      setIsMobile340(window.innerWidth <= 340);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isMobile1100, isMobile380, isMobile360, isMobile340 };
}
