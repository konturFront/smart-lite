import { useLocation, useRoute } from 'preact-iso';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { groupsToMasks, parseGroupMasks } from '../../utils/parseGroupMask';
import {
  saveDriversWithRetry,
  sendMessageSocket,
  showLoadingStateUI,
  updateSettingsDriverWithRetry,
} from '../../store/store';
import { Button } from '../../components/Button/Button';
import { LoadingDots } from '../../components/Loader/LoadingDots';
import styles from './styles.module.scss';
import { h } from 'preact';
import { ArrowIcon } from '../../components/IconComponent/ArrowAction/ArrowIcon';
import { DoubleArrowTopIcon } from '../../components/IconComponent/DoubleArrowIcon/DoubleArrowTopIcon';
import classNames from 'classnames';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { SpeakerIcon } from '../../components/IconComponent/BackIcon/BackIcon';
import { AroundIcon } from '../../components/IconComponent/AroundIcon/AroundIcon';
import { effect } from '@preact/signals';
import { ReleType } from '../../components/DriverTypes/ReleType/ReleType';
import { DimmerType } from '../../components/DriverTypes/DimmerType/DimmerType';
import { TWType } from '../../components/DriverTypes/TWType/TwType';
import { ColorSlider } from '../../components/ColorSlider/ColorSlider';
import { ButtonOnOff } from '../../components/IconComponent/ButtonOnOff/ButtonOnOff';
import { RGBType } from '../../components/DriverTypes/RGBType/RGBType';
import { RGBWType } from '../../components/DriverTypes/RGBWType/RGBWType';
import { RGBTWType } from '../../components/DriverTypes/RGBTWType/RGBTWType';
import { ColorSliderGeneral } from '../../components/ColorSliderGeneral/ColorSliderGeneral';
import { state, stateUI } from '../../store/initialState';
import { ButtonNavigation } from '../../components/ButtonNavigation/ButtonNavigation';

export type ColorState = {
  generalRange: number;
  r: number;
  g: number;
  b: number;
  w: number;
  light: number;
};

const dimmingSteps = [
  2.8, 4.0, 5.6, 7.9, 11.2, 15.8, 22.4, 31.6, 44.7, 63.3, 89.4, 127, 179, 253, 358,
];

const dimmingStepsTime = [
  0, 0.7, 1.0, 1.4, 2.0, 2.8, 4.0, 5.7, 8.0, 11.3, 16.0, 22.6, 32.0, 45.3, 64.0, 90.5,
];

export function DeviceCardPage() {
  const { params } = useRoute();
  const { route } = useLocation();
  const [minLevel, setMinLevel] = useState(1);
  const [isTestingDriver, setTestingDriver] = useState(false);
  const [maxLevel, setMaxLevel] = useState(1);
  const [failureLevel, setFailureLevel] = useState(1);
  const [poweronLevel, setPoweronLevel] = useState(1);
  const [fadeRate, setFadeRate] = useState<number>(2.8);
  const [fadeTime, setFadeTime] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentLevelAllDrivers, setCurrentLevelAllDrivers] = useState(0);
  const [groups, setGroups] = useState<boolean[]>(Array(16).fill(false));
  const [driverSettings, setDriverSettings] = useState<number[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceAllBrightRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoading = stateUI.value.isLoadingUI;
  const [isOpenRGB, setIsOpenRGB] = useState(false);
  const [tab, setTab] = useState<'settings' | 'group'>('settings');
  const { isMobile340, isMobile380, isMobile400 } = useDeviceDetect();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [flagPull, setFlagPull] = useState(false);

  const [typeDriver, setTypeDriver] = useState<number>(undefined);
  const [colors, setColors] = useState({
    generalRange: 0,
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    light: 0,
  });

  // желтый движок на главном
  // 4 - диммер триак; готово   4 и 6 это диммер
  // 6 - светодиодный диммер; ЧТОЭТО!!!!
  // 7 - реле; готово
  // 2 - Tunable White; готово
  // 96 - RGB; готово
  // 98 - RGBW; готово
  // 128 - RGB + Tunable White;

  // samsung galaxy s8+
  // ==========
  // в центре только сам свг серого на желтый  это про свг

  // ============
  // тона выранвить по цвету  где оттенки одинаковые там их и лепить
  // на тесте лампочка мегает чтобы луче полностью пропдаали
  // крестик давбтиь в крутилку

  const testingDriver = useCallback(() => {
    if (!isTestingDriver) {
      setTestingDriver(!isTestingDriver);
      sendMessageSocket({ driver: 'test', cmd: 'start', addres: +params?.id }, false);
    } else {
      sendMessageSocket({ driver: 'test', cmd: 'stop' }, false);
      setTestingDriver(!isTestingDriver);
    }
  }, [isTestingDriver]);

  const fetchSettings = async id => {
    try {
      updateSettingsDriverWithRetry({ driver: 'settyngs', cmd: 'download', addres: +id });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const id = +params?.id;
    if (!id) {
      console.error('Неверный id', id);
    }
    showLoadingStateUI();

    fetchSettings(id).then();
    return () => {
      if (isTestingDriver) {
        sendMessageSocket({ driver: 'test', cmd: 'stop' }, false);
      }
    };
  }, []);

  useEffect(() => {
    const stateStatus = state.value.socketStatus;

    if (stateStatus === 'connected') {
      // Если соединение есть, выключаем анимацию через 2 секунды
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Если соединения нет, включаем бесконечную анимацию
      setShouldAnimate(true);
    }
  }, [state.value.socketStatus]); // Зависимость от статуса соединения

  useEffect(() => {
    if (Array.isArray(state.value.settingsDriver)) {
      const [addressId, type, g07, g815, min, max, fail, power, fadeT, fadeR, level] =
        state.value.settingsDriver;
      setTypeDriver(type);
      const activeGroups = parseGroupMasks(g07, g815);
      const updatedGroups = Array(16)
        .fill(false)
        .map((_, i) => activeGroups.includes(i));
      setMaxLevel(max); //Яркость максимальная
      setMinLevel(min); //Яркость минимальная
      setPoweronLevel(power); //Яркость при запуске
      setFailureLevel(fail); //Яркость при аварии
      setFadeTime(fadeT);
      setFadeRate(fadeR);
      // setCurrentLevel(level);
      setGroups(updatedGroups);
      setDriverSettings(state.value.settingsDriver);
    }
  }, [state.value.settingsDriver]);

  const toggleGroup = (index: number) => {
    setGroups(prev => prev.map((val, i) => (i === index ? !val : val)));
  };

  const updateDebounce = useCallback((e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setCurrentLevel(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // здесь отправка уровня яркости в сокет
      sendMessageSocket(
        {
          driver: 'level',
          mode: 'table',
          brightness: value,
          addres: Number(params?.id),
        },
        false
      );
      showLoadingStateUI();
    }, 500);
  }, []);

  const updateDebounceAllDriversBright = useCallback((e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setCurrentLevelAllDrivers(value);

    if (debounceAllBrightRef.current) {
      clearTimeout(debounceAllBrightRef.current);
    }

    debounceAllBrightRef.current = setTimeout(() => {
      sendMessageSocket(
        {
          driver: 'level',
          mode: 'table',
          brightness: value,
          addres: 255,
        },
        false
      );
      showLoadingStateUI();
    }, 500);
  }, []);

  const handleFadeTimeChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    // setFadeTime(value);
  };

  const handleIncreaseFadeRate = () => {
    const currentIndex = dimmingSteps.findIndex(step => step === fadeRate);
    if (currentIndex < dimmingSteps.length - 1) {
      setFadeRate(dimmingSteps[currentIndex + 1]);
    }
  };

  const handleDecreaseFadeRate = () => {
    const currentIndex = dimmingSteps.findIndex(step => step === fadeRate);
    if (currentIndex > 0) {
      setFadeRate(dimmingSteps[currentIndex - 1]);
    }
  };

  const handleIncreaseFadeTime = () => {
    const currentIndex = dimmingStepsTime.findIndex(step => step === fadeTime);
    if (currentIndex < dimmingStepsTime.length - 1) {
      setFadeTime(dimmingStepsTime[currentIndex + 1]);
    }
  };

  const handleDecreaseFadeTime = () => {
    const currentIndex = dimmingStepsTime.findIndex(step => step === fadeTime);
    if (currentIndex > 0) {
      setFadeTime(dimmingStepsTime[currentIndex - 1]);
    }
  };
  useEffect(() => {
    if (flagPull && !isLoading) {
      setTimeout(() => {
        fetchSettings(+params.id).then();
        setFlagPull(false);
      }, 0);
    }
  }, [flagPull, isLoading]);

  const saveBtnSettings = useCallback(() => {
    const activeGroups = groups
      .map((isActive, index) => (isActive ? index : -1))
      .filter(index => index !== -1);
    const { g07, g815 } = groupsToMasks(activeGroups);
    showLoadingStateUI();
    saveDriversWithRetry({
      driver: 'settyngs',
      cmd: 'save',
      dr_settyngs: [
        Number(params?.id),
        // typeDriver, при получении он ест, при отправке его быть не должно, такое требование спеки
        g07,
        g815,
        minLevel,
        maxLevel,
        failureLevel,
        poweronLevel,
        ...(typeDriver !== 7 ? [+fadeTime, +fadeRate] : []), // Добавляем только если typeDriver не 7
        // currentLevel,
      ],
    });
    setFlagPull(true);
  }, [groups, minLevel, maxLevel, failureLevel, poweronLevel, currentLevel, typeDriver, flagPull]);

  const pullDriverSettings = () => {
    fetchSettings(+params.id);
  };

  return (
    <div className={styles.devices}>
      {isOpenRGB && <div className={styles.backdrop} />}
      <div id={'line'} className={styles.line}></div>

      <div id="drivers-list" className={styles.content}>
        {/*вот сюда враппер который внизу закомичен*/}
        <div className={styles.settingsAndGroupWrapper}>
          <div className={styles.buttonTabs}>
            <div
              className={classNames(
                tab === 'settings'
                  ? styles.buttonTabItemActiveSettings
                  : styles.buttonTabItemSettings
              )}
              onClick={() => setTab('settings')}
            >
              Настройки
            </div>
            <div
              className={classNames(
                tab === 'group' ? styles.buttonTabItemActiveGroup : styles.buttonTabItemGroup
              )}
              onClick={() => setTab('group')}
            >
              Группы
            </div>
          </div>
          {/* Настройки */}
          <div
            className={styles.contentBody}
            style={
              tab == 'settings'
                ? { padding: ' 0 12px 12px 20px' }
                : { padding: ' 0 12px 12px 12px' }
            }
          >
            {tab === 'settings' && (
              <>
                <div className={styles.element}>
                  <div className={styles.valueName}>Яркость максимальная</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (maxLevel > 1) {
                          setMaxLevel(prevState => prevState - 1);
                        }
                      }}
                    />
                    <div className={styles.value}>{`${maxLevel ?? 0}%`}</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (maxLevel < 100) {
                          setMaxLevel(prevState => prevState + 1);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className={styles.element}>
                  <div className={styles.valueName}>Яркость минимальная</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (minLevel > 1) {
                          setMinLevel(prevState => prevState - 1);
                        }
                      }}
                    />
                    <div className={styles.value}>{`${minLevel ?? 0}%`}</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (minLevel < 100) {
                          setMinLevel(prevState => prevState + 1);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className={styles.element}>
                  <div className={styles.valueName}>Яркость при запуске</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (poweronLevel > 1) {
                          setPoweronLevel(prevState => prevState - 1);
                        }
                      }}
                    />
                    <div className={styles.value}>{`${poweronLevel ?? 0}%`}</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (poweronLevel < 100) {
                          setPoweronLevel(prevState => prevState + 1);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className={styles.element}>
                  <div className={styles.valueName}>Яркость при аварии</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (failureLevel > 1) {
                          setFailureLevel(prevState => prevState - 1);
                        }
                      }}
                    />
                    <div className={styles.value}>{`${failureLevel ?? 0}%`}</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                      onClick={() => {
                        if (failureLevel < 100) {
                          setFailureLevel(prevState => prevState + 1);
                        }
                      }}
                    />
                  </div>
                </div>
                {!!typeDriver && typeDriver !== 7 && (
                  <div className={styles.element}>
                    <div className={styles.valueName}>Плавное вкл/выкл</div>
                    <div className={styles.valueWrapper}>
                      <ArrowIcon
                        direction={'right'}
                        double={false}
                        width={isMobile340 ? 28 : 32}
                        height={isMobile340 ? 28 : 32}
                        onClick={handleDecreaseFadeTime}
                      />
                      <div className={styles.value}>{fadeTime ?? 0}</div>
                      <ArrowIcon
                        direction={'left'}
                        double={false}
                        width={isMobile340 ? 28 : 32}
                        height={isMobile340 ? 28 : 32}
                        onClick={handleIncreaseFadeTime}
                      />
                    </div>
                  </div>
                )}
                {!!typeDriver && typeDriver !== 7 && (
                  <div className={styles.element}>
                    <div className={styles.valueName}>Шаг димирования</div>
                    <div className={styles.valueWrapper}>
                      <ArrowIcon
                        direction={'right'}
                        double={false}
                        width={isMobile340 ? 28 : 32}
                        height={isMobile340 ? 28 : 32}
                        onClick={handleDecreaseFadeRate}
                      />
                      <div className={styles.value}>{fadeRate ?? 0}</div>
                      <ArrowIcon
                        direction={'left'}
                        double={false}
                        width={isMobile340 ? 28 : 32}
                        height={isMobile340 ? 28 : 32}
                        onClick={handleIncreaseFadeRate}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {tab === 'group' && (
              <div className={styles.groupFlex}>
                {groups.map((isChecked, index) => (
                  <div key={index} className={styles.groupItem} onClick={() => toggleGroup(index)}>
                    {index}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly // важно, чтобы React не ругался
                    />
                  </div>
                ))}
              </div>
            )}

            {/*Удалить только для теста изменения*/}
            {/*<div style={{ display: 'flex', gap: '20px' }}>*/}
            {/*  {[4, 7, 2, 96, 98, 128].map(type => (*/}
            {/*    <div*/}
            {/*      key={type}*/}
            {/*      className={typeDriver === type ? styles.activeType : ''}*/}
            {/*      onClick={() => setTypeDriver(type)}*/}
            {/*    >*/}
            {/*      {type}*/}
            {/*    </div>*/}
            {/*  ))}*/}
            {/*</div>*/}
            {/*Удалить только для теста изменения*/}
          </div>
        </div>
      </div>
      {/*//КНОПКИ управления*/}
      <div className={styles.wrapperBtn}>
        {isLoading || flagPull ? (
          <div className={styles.loadingText}>
            <LoadingDots />
          </div>
        ) : (
          <>
            <div
              onClick={() => {
                route('/service');
              }}
            >
              <SpeakerIcon height={isMobile400 ? 50 : 56} width={isMobile400 ? 50 : 56} />
            </div>

            <AroundIcon
              height={isMobile400 ? 50 : 56}
              width={isMobile400 ? 50 : 56}
              className={shouldAnimate ? styles.spin : ''}
              // color={state.value.socketStatus === 'connected' ? '#1FFF1B' : '#FF2A16'}
              color={state.value.socketStatus === 'connected' ? '#1FFF1B' : '#ac2015'}
            />
            <ButtonNavigation
              text="Обновить"
              onClick={() => {
                pullDriverSettings();
              }}
            />
            <ButtonNavigation
              text="Сохранить"
              onClick={() => {
                saveBtnSettings();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

{
  /*<div className={styles.sliderWrapper}>*/
}
{
  /*  {(typeDriver === 4 || typeDriver === 6) && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*      <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>*/
}
{
  /*          <ColorSliderGeneral*/
}
{
  /*            fromColor={'#fff584'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div*/
}
{
  /*          style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}*/
}
{
  /*          onClick={e => {*/
}
{
  /*            e.stopPropagation(); // чтобы не срабатывал клик по родителю*/
}
{
  /*            setIsOpenRGB(!isOpenRGB);*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}
{
  /*  {typeDriver === 2 && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*      <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            withOutValue={true}*/
}
{
  /*            fromColor={'#cbe9fd'}*/
}
{
  /*            toColor={'#fef7cb'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*            minValue={2000}*/
}
{
  /*            maxValue={6000}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div*/
}
{
  /*          style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}*/
}
{
  /*          onClick={e => {*/
}
{
  /*            e.stopPropagation(); // чтобы не срабатывал клик по родителю*/
}
{
  /*            setIsOpenRGB(!isOpenRGB);*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}
{
  /*  {typeDriver === 7 && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}

{
  /*  {typeDriver === 96 && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*      <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>*/
}
{
  /*          <ColorSliderGeneral*/
}
{
  /*            fromColor={'#fff584'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#ff113a'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'r'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#26ff43'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'g'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#0466FF'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'b'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div*/
}
{
  /*          style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}*/
}
{
  /*          onClick={e => {*/
}
{
  /*            e.stopPropagation(); // чтобы не срабатывал клик по родителю*/
}
{
  /*            setIsOpenRGB(!isOpenRGB);*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}
{
  /*  {typeDriver === 98 && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*      <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>*/
}
{
  /*          <ColorSliderGeneral*/
}
{
  /*            fromColor={'#fff584'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'white'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'w'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#ff113a'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'r'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#26ff43'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'g'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#0466FF'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'b'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div*/
}
{
  /*          style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}*/
}
{
  /*          onClick={e => {*/
}
{
  /*            e.stopPropagation(); // чтобы не срабатывал клик по родителю*/
}
{
  /*            setIsOpenRGB(!isOpenRGB);*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}
{
  /*  {typeDriver === 128 && (*/
}
{
  /*    <>*/
}
{
  /*      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 12px' }}>*/
}
{
  /*        <div*/
}
{
  /*          className={`${styles.buttonOnOff} ${colors.generalRange > 0 ? styles.buttonOnOffActive : ''}`}*/
}
{
  /*          onClick={() => {*/
}
{
  /*            setColors(prevState => ({*/
}
{
  /*              ...prevState,*/
}
{
  /*              generalRange: prevState.generalRange > 0 ? 0 : 100,*/
}
{
  /*            }));*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <ButtonOnOff color={colors.generalRange > 0 ? 'white' : 'grey'} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}

{
  /*      <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>*/
}
{
  /*          <ColorSliderGeneral*/
}
{
  /*            fromColor={'#fff584'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            withOutValue={true}*/
}
{
  /*            fromColor={'#cbe9fd'}*/
}
{
  /*            toColor={'#fef7cb'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'light'}*/
}
{
  /*            minValue={2000}*/
}
{
  /*            maxValue={6000}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#ff113a'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'r'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#26ff43'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'g'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}
{
  /*        <div style={{ display: 'flex', width: '100%' }}>*/
}
{
  /*          <ColorSlider*/
}
{
  /*            fromColor={'#0466FF'}*/
}
{
  /*            value={colors}*/
}
{
  /*            setValue={setColors}*/
}
{
  /*            field={'b'}*/
}
{
  /*          />*/
}
{
  /*        </div>*/
}

{
  /*        <div*/
}
{
  /*          style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}*/
}
{
  /*          onClick={e => {*/
}
{
  /*            e.stopPropagation(); // чтобы не срабатывал клик по родителю*/
}
{
  /*            setIsOpenRGB(!isOpenRGB);*/
}
{
  /*          }}*/
}
{
  /*        >*/
}
{
  /*          <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*        </div>*/
}
{
  /*      </div>*/
}
{
  /*    </>*/
}
{
  /*  )}*/
}

{
  /*  /!*показывать стрелку разворота*!/*/
}
{
  /*  {isOpenRGB || typeDriver === 7 ? null : (*/
}
{
  /*    <div*/
}
{
  /*      style={{ position: 'absolute', backgroundColor: '#525252' }}*/
}
{
  /*      onClick={() => setIsOpenRGB(true)}*/
}
{
  /*    >*/
}
{
  /*      <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />*/
}
{
  /*    </div>*/
}
{
  /*  )}*/
}
{
  /*</div>*/
}
