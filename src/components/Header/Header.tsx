import { Drawer } from '../Drawer/Drawer';
import styles from './styles.module.scss';
import { useLocation, useRoute } from 'preact-iso';
import { getTitle } from './utils/getTitlePage';
import { state, stateUI } from '../../store/initialState';
import { useEffect } from 'preact/hooks';
import { getStateBusWithRetry } from '../../store/store';
import { InfoIcon } from '../IconComponent/IconInfo/InfoIcon';

export function Header() {
  const socketStatus = state.value.socketStatus;
  const location = useLocation();
  const { params } = useRoute();
  const currentTitle = getTitle(location.path);

  useEffect(() => {
    getStateBusWithRetry();

    const interval = setInterval(() => {
      getStateBusWithRetry();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
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
          </div>
          <div className={styles.title}>{currentTitle}</div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <div
              className={
                state.value.stateBus === 1
                  ? styles.stateBusIndicatorActive
                  : styles.stateBusIndicatorDisabled
              }
            >
              {'DALI'}
            </div>
            <InfoIcon />
          </div>
        </div>
      </div>
      <Drawer />
    </>
  );
}
