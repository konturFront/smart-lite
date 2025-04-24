import { Drawer } from '../Drawer/Drawer';
import styles from './styles.module.scss';
import { state, stateUI } from '../../store/store';
import { Loader } from '../Loader/Loader';
import { WifiIcon } from '../Wifi/Wifi';
import { useLocation, useRoute } from 'preact-iso';
import { getTitle } from './utils/getTitlePage';

export function Header() {
  const socketStatus = state.value.socketStatus;
  const location = useLocation();
  const { params } = useRoute();
  const currentTitle = getTitle(location.path);
  return (
    <>
      <div className={styles.header}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: '0 0 auto',
            justifyContent: 'flex-start',
            gap: '10px',
          }}
        >
          <div
            className={styles.burgerBtn}
            onClick={() => {
              stateUI.value = {
                ...stateUI.value,
                isActiveMenu: !stateUI.value.isActiveMenu,
              };
            }}
          >
            <div className={styles.burgerBtnItem} />
            <div className={styles.burgerBtnItem} />
            <div className={styles.burgerBtnItem} />
          </div>
        </div>
        <div className={styles.title}>{currentTitle}</div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <WifiIcon size={40} rate={2} />
          </div>
          <div
            id="socket-indicator"
            className={`${styles.status} ${styles[socketStatus]}`}
            style={{ display: 'flex', height: '100%' }}
          ></div>
        </div>
      </div>
      <Drawer />
    </>
  );
}
