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

export const SettingsPage = () => {
  const [mode, setMode] = useState<'host' | 'ap'>('ap');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [reUrl, setReUrl] = useState('');
  const [isOpenModalSearch, setOpenModalSearch] = useState(false);
  const { isMobile340, isMobile380, isMobile400 } = useDeviceDetect();
  const isLoading = stateUI.value.isLoadingUI;
  const [filteredNetworks, setFilteredNetworks] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ssidLabelRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetMaster = useCallback(() => {
    sendMessageSocket({ master: 'reset', cmd: 'start' });
  }, []);

  const reConnectWS = useCallback(() => {
    if (reUrl.length > 0) {
      reconnectWS(reUrl);
      state.value = { ...state.value, socketURL: reUrl };
    }
  }, [reUrl]);

  // Обработчик кликов вне поля
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ssidLabelRef.current && !ssidLabelRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredNetworks(
      state.value.wifiNetworks.filter(net => net.toLowerCase().includes(ssid.toLowerCase()))
    );
  }, [state.value.wifiNetworks, ssid]);

  const saveSettingsWifi = useCallback(() => {
    if (mode === 'host') {
      if (ssid.trim() && password.trim()) {
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
    scanWIFIWithRetry({ master: 'scan', cmd: 'start' });
  }, []);

  return (
    <div className={styles.devices}>
      <div className={styles.content}>
        <div className={styles.panel}>
          <label>
            Режим подключения:
            <input
              onClick={() => {
                setOpenModalSearch(true);
              }}
              autoComplete="off"
              type="text"
              readOnly={true}
              value={mode === 'host' ? 'Подключиться к сети' : 'Создать точку доступа'}
              onInput={e => setSsid((e.target as HTMLInputElement).value)}
            />
          </label>
          {mode === 'host' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '20px' }}>
                <div> Имя сети:</div>
                <div ref={ssidLabelRef} style={{ position: 'relative' }}>
                  <input
                    autoComplete="off"
                    type="text"
                    id="wifi-ssid"
                    placeholder="Введите имя сети"
                    value={ssid}
                    onClick={() => {
                      setShowSuggestions(true);
                      setFilteredNetworks(state.value.wifiNetworks);
                    }}
                    onInput={e => {
                      const value = (e.target as HTMLInputElement).value;
                      setSsid(value);
                      setFilteredNetworks(
                        state.value.wifiNetworks.filter(net =>
                          net.toLowerCase().includes(value.toLowerCase())
                        )
                      );
                    }}
                  />

                  {showSuggestions && (
                    <div className={styles.suggestions}>
                      <button className={styles.scanButton} onClick={scanWifiNet} type="button">
                        <span className={isLoading ? styles.spinner : ''}>🔄</span> Сканировать
                      </button>

                      {filteredNetworks.length > 0 ? (
                        filteredNetworks.map((net, i) => (
                          <div
                            key={i}
                            className={styles.suggestionItem}
                            onClick={() => {
                              setSsid(net);
                              setShowSuggestions(false);
                            }}
                          >
                            {net}
                          </div>
                        ))
                      ) : (
                        <div className={styles.noNetworks}>Нет доступных сетей</div>
                      )}
                    </div>
                  )}
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
            </>
          )}
        </div>
      </div>
      <Modal
        maxWidth="md"
        open={isOpenModalSearch}
        onClose={() => {}}
        buttonsType="single"
        singleButtonText="Отмена"
        showCloseButton={false}
        singleButtonAction={() => {
          setOpenModalSearch(false);
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
            <div className={styles.btnChoose}>
              <Button
                sx={{ minWidth: isMobile340 ? '240px' : '270px' }}
                text="Подключиться к сети"
                onClick={() => {
                  setMode('host');
                  setOpenModalSearch(false);
                }}
              />
            </div>
            <div className={styles.btnChoose}>
              <Button
                sx={{ minWidth: isMobile340 ? '240px' : '270px' }}
                text="Создать точку доступа"
                onClick={() => {
                  setMode('ap');
                  setOpenModalSearch(false);
                }}
              />
            </div>
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
                onClick={saveSettingsWifi}
              />
              {/*<ButtonNavigation text="Сканировать сети" sx={{ width: '150px' }} />*/}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
