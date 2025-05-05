import styles from './styles.module.scss';
import { useCallback, useState } from 'preact/hooks';
import { reconnectWS, sendMessageSocket, state } from '../../store/store';
import { Button } from '../../components/Button/Button';

export const SettingsPage = () => {
  const [mode, setMode] = useState<'host' | 'up'>('up');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [reUrl, setReUrl] = useState('');

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
    if (ssid.trim() && password.trim()) {
      sendMessageSocket({
        master: 'net',
        cmd: 'save',
        mode,
        ssid,
        password,
      });
    } else {
      alert('Пожалуйста, введите SSID и пароль');
    }
  }, [ssid, password, mode]);

  const scanWifiNet = useCallback(() => {
    sendMessageSocket({ master: 'scan', cmd: 'start' });
  }, []);

  return (
    <div className={styles.settings}>
      <div className={styles.settingsPanel}>
        {/*<div className={styles.wrapperBtn}>*/}
        {/*  <Button text=" Перезагрузка Мастера" onClick={resetMaster} />*/}
        {/*</div>*/}
        <div className={styles.panel}>
          <label>
            Режим подключения:
            <select
              value={mode}
              onChange={e => {
                setMode((e.target as HTMLSelectElement).value as 'host' | 'up');
              }}
            >
              <option value="host">Создать точку доступа</option>
              <option value="up">Подключиться к сети</option>
            </select>
          </label>
          <label>
            Имя сети:
            <input
              autoComplete="off"
              type="text"
              id="wifi-ssid"
              placeholder="Введите имя сети"
              value={ssid}
              onInput={e => setSsid((e.target as HTMLInputElement).value)}
            />
          </label>
          <label>
            Пароль:
            <input
              autoComplete="off"
              type="text"
              id="wifi-password"
              placeholder="Введите пароль"
              value={password}
              onInput={e => setPassword((e.target as HTMLInputElement).value)}
            />
          </label>
          <div className={styles.wrapperBtn}>
            <Button text="Сохранить настройки Wi-Fi" onClick={saveSettingsWifi} />
          </div>
          <label style={{ marginTop: '20px' }}>
            URL WebSocket-сервера:
            <div className={styles.wsUrlWrapper}>
              <input
                type="text"
                value={reUrl}
                onInput={e => {
                  setReUrl((e.target as HTMLInputElement).value);
                }}
              />
              <div className={styles.wrapperBtn}>
                <Button text=" Переподключить сокет" onClick={reConnectWS} />
              </div>
            </div>
          </label>
        </div>

        <div className={styles.wrapperBtn}>
          <Button text="    Сканировать сети" onClick={scanWifiNet} />
        </div>
        <div className={styles.wifiNetworks}>
          {state.value.wifiNetworks.map(item => (
            <div className={styles.wifiTag} onClick={() => setSsid(item)}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
