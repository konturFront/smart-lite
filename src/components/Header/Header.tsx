import { Drawer } from '../Drawer/Drawer';
import styles from './styles.module.scss';
import { state, stateUI } from '../../store/store';
import { Loader } from '../Loader/Loader';
import { WifiIcon } from '../Wifi/Wifi';
import { useLocation, useRoute } from 'preact-iso';
import { getTitle } from './utils/getTitlePage';
import { InfoIcon } from '../IconInfo/InfoIcon';

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
            justifyContent: 'flex-start',
            gap: '14px',
            flex: '0 0 auto',
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
          <WifiIcon size={30} rate={2} />
        </div>
        <div className={styles.title}>{currentTitle}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 auto',
          }}
        >
          <InfoIcon />
        </div>
      </div>
      <Drawer />
    </>
  );
}
