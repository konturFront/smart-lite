import styles from './styles.module.scss';
import { useCallback, useState, useRef, useEffect } from 'preact/hooks';
import {
  reconnectWS,
  saveAPWithRetry,
  saveWIFIWithRetry,
  scanWIFIWithRetry,
  sendMessageSocket,
} from '../../store/store';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { h } from 'preact';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { state, stateUI } from '../../store/initialState';
import { LoadingDots } from '../../components/Loader/LoadingDots';
import { SpeakerIcon } from '../../components/IconComponent/BackIcon/BackIcon';
import { ButtonNavigation } from '../../components/ButtonNavigation/ButtonNavigation';
import classNames from 'classnames';
import { ArrowIcon } from '../../components/IconComponent/ArrowAction/ArrowIcon';
import { __DEV__, GLOBAL_WS_URL } from '../../global/value';
import { scanWIFIWithCheck, withControllerCheck } from '../../store/ensureControllerFree';

export const SettingsPage = () => {
  const [mode, setMode] = useState<'host' | 'ap'>('ap');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [reUrl, setReUrl] = useState('');
  const [isOpenModalSearch, setOpenModalSearch] = useState(false);
  const { isMobile340, isMobile380, isMobile400, isMobile440 } = useDeviceDetect();
  const isLoading = stateUI.value.isLoadingUI;
  const ssidLabelRef = useRef<HTMLDivElement>(null);

  const resetMaster = useCallback(() => {
    sendMessageSocket({ master: 'reset', cmd: 'start' });
  }, []);

  const reConnectWS = useCallback(() => {
    if (reUrl.length > 0) {
      reconnectWS(reUrl);
      state.value = { ...state.value, socketURL: reUrl };
    }
  }, [reUrl]);

  const saveSettingsWifi = useCallback(() => {
    if (mode === 'host') {
      if (ssid.trim() && password.trim()) {
        setOpenModalSearch(true);
        saveWIFIWithRetry({
          master: 'net',
          cmd: 'save',
          memory: 'yes',
          mode,
          ssid,
          password,
        });
      } else {
        alert('Пожалуйста, введите SSID и пароль');
      }
    } else if (mode == 'ap') {
      setOpenModalSearch(true);

      saveAPWithRetry({
        master: 'net',
        cmd: 'save',
        memory: 'yes',
        mode,
      });
    }
  }, [ssid, password, mode]);

  const scanWifiNet = useCallback(() => {
    setSsid('');
    const _fnWithCheck = withControllerCheck(scanWIFIWithRetry);
    _fnWithCheck({ master: 'scan', cmd: 'start' });
  }, []);

  return (
    <div className={styles.devices}>
      <div id="drivers-list" className={styles.content}>
        <div className={styles.settingsAndGroupWrapper}>
          <div className={styles.buttonTabs}>
            <div
              className={classNames(
                mode === 'ap' ? styles.buttonTabItemActiveSettings : styles.buttonTabItemSettings
              )}
              onClick={() => setMode('ap')}
            >
              {isMobile440 ? (
                <span>
                  Создать точку
                  <br /> доступа
                </span>
              ) : (
                <span> Создать точку доступа</span>
              )}
            </div>
            <div
              className={classNames(
                mode === 'host' ? styles.buttonTabItemActiveGroup : styles.buttonTabItemGroup
              )}
              onClick={() => setMode('host')}
            >
              {isMobile440 ? (
                <span>
                  {' '}
                  Подключиться
                  <br /> к WiFi
                </span>
              ) : (
                <span> Подключиться к WiFi</span>
              )}
            </div>
          </div>
          {/* Точка доступа */}
          <div className={styles.contentBody}>
            {mode === 'host' && (
              <div className={styles.panel}>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '20px' }}>
                  <div> Имя сети:</div>
                  <div ref={ssidLabelRef} style={{ position: 'relative' }}>
                    <input
                      autoComplete="off"
                      type="text"
                      id="wifi-ssid"
                      placeholder="Введите имя сети"
                      value={ssid}
                      onInput={e => {
                        const value = (e.target as HTMLInputElement).value;
                        setSsid(value);
                      }}
                    />
                  </div>
                </div>
                <label>
                  Пароль:
                  <input
                    autoComplete="off"
                    type={'text'}
                    id="wifi-password"
                    placeholder="Введите пароль"
                    value={password}
                    onInput={e => setPassword((e.target as HTMLInputElement).value)}
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <ButtonNavigation
                    text="Сканировать WiFi"
                    onClick={scanWifiNet}
                    sx={{ width: 'auto' }}
                  />
                </div>
                <div className={styles.wifiNetworksWrapper}>
                  <div className={styles.wifiNetworks}>
                    {state.value.wifiNetworks.map(item => (
                      <ButtonNavigation
                        text={item}
                        onClick={() => setSsid(item)}
                        sx={{ width: 'auto' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Точка доступа */}
            {mode === 'ap' && <></>}
          </div>
        </div>
      </div>
      <Modal
        maxWidth="md"
        open={isOpenModalSearch}
        onClose={() => {}}
        buttonsType="none"
        singleButtonText="Отмена"
        showCloseButton={false}
        singleButtonAction={() => {
          if (__DEV__) {
            setOpenModalSearch(false);
          } else {
          }
        }}
      >
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '40px',
              padding: '16px 0',
              marginBottom: '20px',
            }}
          >
            {mode === 'ap' ? (
              <div style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>
                Режим точки доступа запущен.
                <br />
                Переподключитесь на сеть DALI Master по адресу:
                <p>
                  <a
                    href={`http://${GLOBAL_WS_URL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'white' }}
                  >
                    {`http://${GLOBAL_WS_URL}`}
                  </a>
                </p>
                <button
                  onClick={() => {
                    window.location.href = `http://${GLOBAL_WS_URL}`;
                  }}
                  style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Перейти сейчас
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>
                Подключитесь к WiFi
                <br />
                Переподключитесь на сеть DALI Master по адресу:
                <p>
                  <a
                    href={`http://${GLOBAL_WS_URL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'white' }}
                  >
                    {`http://${GLOBAL_WS_URL}`}
                  </a>
                </p>
                <p style={{ marginTop: '10px' }}></p>
                <button
                  onClick={() => {
                    window.location.href = `http://${GLOBAL_WS_URL}`;
                  }}
                  style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Перейти сейчас
                </button>
              </div>
            )}
          </div>
        </>
      </Modal>
      <div className={styles.wrapperBtn}>
        {isLoading ? (
          <div className={styles.loadingText}>
            <LoadingDots />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '20px' }}>
              <ButtonNavigation
                text={mode === 'ap' ? 'Создать точку доступа' : 'Подключиться к сети'}
                sx={{ width: 'auto' }}
                onClick={() => {
                  saveSettingsWifi();
                }}
              />
              {/*<ButtonNavigation text="Сканировать сети" sx={{ width: '150px' }} />*/}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
