import styles from './styles.module.scss';
import { useCallback, useState, useRef, useEffect } from 'preact/hooks';
import {
  levelBroadcastWithRetry,
  reconnectWS,
  saveAPWithRetry,
  saveWIFIWithRetry,
  scanWIFIWithRetry,
  sendMessageSocket,
  updateSettingsDriverWithRetry,
} from '../../store/store';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { h } from 'preact';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { state, stateUI } from '../../store/initialState';
import { LoadingDots } from '../../components/Loader/LoadingDots';
import { SpeakerIcon } from '../../components/IconComponent/BackIcon/BackIcon';
import { ButtonNavigation } from '../../components/ButtonNavigation/ButtonNavigation';

import { scanWIFIWithCheck, withControllerCheck } from '../../store/ensureControllerFree';
import { ButtonOnOff } from '../../components/IconComponent/ButtonOnOff/ButtonOnOff';
import { ColorSlider } from '../../components/ColorSlider/ColorSlider';
import { ColorSliderGeneral } from '../../components/ColorSliderGeneral/ColorSliderGeneral';
export const initialColors = {
  generalRange: 0,
  r: 0,
  g: 0,
  b: 0,
  w: 0,
  light: 0,
};

export enum EDriverMode {
  LEVEL = 'LEVEL',
  TW = 'TW',
  RGB = 'RGB',
  RGBW = 'RGBW',
  RGB_TW = 'RGB+TW',
}

export const BroadcastPage = () => {
  const isLoading = stateUI.value.isLoadingUI || stateUI.value.isLoadingIntervalStatus;
  const [driverMode, setDriverMode] = useState<EDriverMode>(EDriverMode.LEVEL);
  const [isOpenDriverModeModal, setOpenDriverModeModal] = useState(false);
  const [colors, setColors] = useState(initialColors);
  const resetColors = () => setColors(initialColors);
  const isFirstRender = useRef(true);

  const getModeDriver = () => {
    return driverMode;
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // помечаем, что уже был первый рендер
      return; // пропускаем выполнение эффекта
    }

    const timer = setTimeout(() => {
      const _driverMode = getModeDriver();
      if (_driverMode === EDriverMode.LEVEL) {
        const fnWithCheck = withControllerCheck(levelBroadcastWithRetry, false);
        fnWithCheck({
          driver: 'level',
          mode: 'table',
          brightness: colors.generalRange,
          addres: 255,
        });
      }
      if (_driverMode === EDriverMode.TW) {
        const fnWithCheck = withControllerCheck(levelBroadcastWithRetry, false);
        fnWithCheck({
          driver: 'tw',
          cmd: 'broatcast',
          mode: 'table',
          temperature: colors.light,
          addres: 255,
          brightness: colors.generalRange,
        });
      }
    }, 300);

    return () => clearTimeout(timer); // <--- вызывается ПЕРЕД НОВЫМ запуском useEffect
  }, [colors]);

  return (
    <div className={styles.devices}>
      <div id="drivers-list" className={styles.content}>
        <div className={styles.sliderWrapper}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{
                minWidth: '200px',
                fontSize: '30px',
                paddingTop: 0,
                paddingBottom: 0,
              }}
              text={`  ${driverMode}`}
              onClick={() => setOpenDriverModeModal(true)}
            />
          </div>
          {/*//Кнопка вкл и выкл level*/}
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>
            <div
              className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}
              onClick={() => {
                setColors(prevState => ({
                  ...prevState,
                  generalRange: prevState.generalRange > 0 ? 0 : 100,
                }));
              }}
            >
              <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />
            </div>
          </div>
          <div className={`${styles.rgbPanel} ${styles.open} `}>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
              <ColorSliderGeneral
                fromColor={'#fff584'}
                value={colors}
                setValue={setColors}
                field={'light'}
              />
            </div>
            {driverMode === 'RGBW' && (
              <div style={{ display: 'flex', width: '100%' }}>
                <ColorSlider fromColor={'white'} value={colors} setValue={setColors} field={'w'} />
              </div>
            )}

            {['TW', 'RGB+TW'].includes(driverMode) && (
              <div style={{ display: 'flex', width: '100%' }}>
                <ColorSlider
                  withOutValue={true}
                  fromColor={'#cbe9fd'}
                  toColor={'#fef7cb'}
                  value={colors}
                  setValue={setColors}
                  field={'light'}
                  minValue={2000}
                  maxValue={6000}
                />
              </div>
            )}
            {['RGB', 'RGB+TW', 'RGBW'].includes(driverMode) && (
              <div style={{ display: 'flex', width: '100%' }}>
                <ColorSlider fromColor="#ff113a" value={colors} setValue={setColors} field="r" />
              </div>
            )}
            {['RGB', 'RGB+TW', 'RGBW'].includes(driverMode) && (
              <div style={{ display: 'flex', width: '100%' }}>
                <ColorSlider
                  fromColor={'#26ff43'}
                  value={colors}
                  setValue={setColors}
                  field={'g'}
                />
              </div>
            )}
            {['RGB', 'RGB+TW', 'RGBW'].includes(driverMode) && (
              <div style={{ display: 'flex', width: '100%' }}>
                <ColorSlider
                  fromColor={'#0466FF'}
                  value={colors}
                  setValue={setColors}
                  field={'b'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        maxWidth="sm"
        open={isOpenDriverModeModal}
        onClose={() => setOpenDriverModeModal(false)}
        buttonsType="none"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
            Выберите тип драйвера
          </h3>
          {/*{(['LEVEL', 'TW', 'RGB', 'RGBW', 'RGB+TW'] as const).map(mode => (*/}
          {(['LEVEL', 'TW'] as const).map(mode => (
            <Button
              key={mode}
              sx={{
                minWidth: '150px',
                fontSize: '30px',
                paddingTop: 0,
                paddingBottom: 0,
              }}
              text={mode.toUpperCase()}
              onClick={() => {
                setDriverMode(mode);
                setOpenDriverModeModal(false);
              }}
            />
          ))}
        </div>
      </Modal>
      <div className={styles.wrapperBtn}>
        {isLoading ? (
          <div className={styles.loadingText}>
            <LoadingDots />
          </div>
        ) : (
          <>
            {/*<div style={{ display: 'flex', gap: '20px',visibility:'hidden' }}> */}
            {/*  <ButtonNavigation*/}
            {/*    text={'Сохранить'}*/}
            {/*    sx={{ width: 'auto' }}*/}
            {/*    onClick={() => {*/}
            {/*      saveSettingsBroadcast();*/}
            {/*    }}*/}
            {/*  />*/}
            {/*  /!*<ButtonNavigation text="Сканировать сети" sx={{ width: '150px' }} />*!/*/}
            {/*</div>*/}
          </>
        )}
      </div>
    </div>
  );
};
