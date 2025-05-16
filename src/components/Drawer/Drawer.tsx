import styles from './styles.module.scss';
import { useLocation } from 'preact-iso';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { stateUI } from '../../store/initialState';

export const Drawer = () => {
  const { url, route } = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const handlerChangeRoute = useCallback((str: string) => {
    stateUI.value = { ...stateUI.value, isActiveMenu: false };
    route(str);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        stateUI.value = { ...stateUI.value, isActiveMenu: false };
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={drawerRef}
      className={`${styles.drawer} ${stateUI.value.isActiveMenu ? styles.active : ''}`}
    >
      <div className={styles.menu}>
        <div
          className={url === '/service/devices' ? styles.activeLink : ''}
          onClick={() => handlerChangeRoute('/service/devices')}
        >
          {'Драйверы'}
        </div>
        <div
          className={url === '/settings' ? styles.activeLink : ''}
          onClick={() => handlerChangeRoute('/settings')}
        >
          {'Wi-Fi'}
        </div>
        <div
          className={url === '/broadcast' ? styles.activeLink : ''}
          onClick={() => handlerChangeRoute('/broadcast')}
        >
          {'Broadcast'}
        </div>
      </div>
    </div>
  );
};
