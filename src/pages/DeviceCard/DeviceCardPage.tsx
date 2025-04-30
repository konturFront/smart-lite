import { useLocation, useRoute } from 'preact-iso';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { groupsToMasks, parseGroupMasks } from '../../utils/parseGroupMask';
import { sendMessageSocket, showLoadingStateUI, state, stateUI } from '../../store/store';
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

export type ColorState = {
  generalRange: number;
  r: number;
  g: number;
  b: number;
  w: number;
  light: number;
};

export function DeviceCardPage() {
  const { params } = useRoute();
  const { route } = useLocation();
  const [minLevel, setMinLevel] = useState(1);
  const [isTestingDriver, setTestingDriver] = useState(false);
  const [maxLevel, setMaxLevel] = useState(1);
  const [failureLevel, setFailureLevel] = useState(1);
  const [poweronLevel, setPoweronLevel] = useState(1);
  const [fadeTime, setFadeTime] = useState('0');
  const [fadeRate, setFadeRate] = useState('0');
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
  const [typeDriver, setTypeDriver] = useState<number>(4);
  const [colors, setColors] = useState({
    generalRange: 0,
    r: 0,
    g: 0,
    b: 0,
    w: 0,
    light: 0,
  });

  // 4 - диммер триак; готово
  // 6 - светодиодный диммер; ЧТОЭТО!!!!
  // 7 - реле; готово
  // 2 - Tunable White; готово
  // 96 - RGB; готово
  // 98 - RGBW; готово
  // 128 - RGB + Tunable White;

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
      showLoadingStateUI();
      sendMessageSocket({ driver: 'settyngs', cmd: 'download', addres: +id });
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   const id = +params?.id;
  //   if (!id) {
  //     console.error('Неверный id', id);
  //   }
  //   showLoadingStateUI();
  //
  //   fetchSettings(id).then();
  //   return () => {
  //     if (isTestingDriver) {
  //       sendMessageSocket({ driver: 'test', cmd: 'stop' }, false);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 3000); // после 2 секунд (две анимации по 1с)
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  effect(() => {
    const stateStatus = state.value.socketStatus;

    setShouldAnimate(true);
  });

  useEffect(() => {
    if (Array.isArray(state.value.settingsDriver)) {
      const [addressId, g07, g815, min, max, fail, power, fadeT, fadeR, level] =
        state.value.settingsDriver;
      const activeGroups = parseGroupMasks(g07, g815);
      const updatedGroups = Array(16)
        .fill(false)
        .map((_, i) => activeGroups.includes(i));

      setMinLevel(min);
      setMaxLevel(max);
      setFailureLevel(fail);
      setPoweronLevel(power);
      setFadeTime(String(fadeT));
      setFadeRate(String(fadeR));
      setCurrentLevel(level);
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
    setFadeTime(value);
  };

  const handleFadeRateChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    setFadeRate(value);
  };

  const saveBtnSettings = useCallback(() => {
    const activeGroups = groups
      .map((isActive, index) => (isActive ? index : -1))
      .filter(index => index !== -1);

    const { g07, g815 } = groupsToMasks(activeGroups);
    showLoadingStateUI();
    sendMessageSocket({
      driver: 'settyngs',
      cmd: 'save',
      dr_settyngs: [
        Number(params?.id),
        g07,
        g815,
        minLevel,
        maxLevel,
        failureLevel,
        poweronLevel,
        +fadeTime,
        +fadeRate,
        currentLevel,
      ],
    });
  }, [groups, minLevel, maxLevel, failureLevel, poweronLevel, fadeTime, fadeRate, currentLevel]);

  const pullDriverSettings = () => {
    showLoadingStateUI();
    fetchSettings(+params.id);
  };

  console.log('colors', colors);
  return (
    <div className={styles.devices}>
      {isOpenRGB && <div className={styles.backdrop} />}
      <div id={'line'} className={styles.line}></div>

      <div id="drivers-list" className={styles.content}>
        <div className={styles.sliderWrapper}>
          {typeDriver === 4 && (
            <>
              <DimmerType value={colors} setValue={setColors} />
            </>
          )}
          {typeDriver === 2 && (
            <>
              <TWType value={colors} setValue={setColors} />
              <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#cbe9fd'}
                    toColor={'#fef7cb'}
                    value={colors}
                    setValue={setColors}
                    field={'light'}
                    minValue={2000}
                    maxValue={6000}
                  />
                  <div className={styles.buttonOnOff} style={{ visibility: 'hidden' }}>
                    <ButtonOnOff />
                  </div>
                </div>
                <div
                  style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}
                  onClick={e => {
                    e.stopPropagation(); // чтобы не срабатывал клик по родителю
                    setIsOpenRGB(!isOpenRGB);
                  }}
                >
                  <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />
                </div>
              </div>
            </>
          )}
          {typeDriver === 7 && <ReleType setValue={setColors} value={colors} />}

          {typeDriver === 96 && (
            <>
              <RGBType value={colors} setValue={setColors} />
              <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#ff113a'}
                    value={colors}
                    setValue={setColors}
                    field={'r'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.r > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, r: colors.r > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.r > 0 ? (
                      <div>{`${colors.r} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.r > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#26ff43'}
                    value={colors}
                    setValue={setColors}
                    field={'g'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.g > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, g: colors.g > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.g > 0 ? (
                      <div>{`${colors.g} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.g > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#0466FF'}
                    value={colors}
                    setValue={setColors}
                    field={'b'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.b > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, b: colors.b > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.b > 0 ? (
                      <div>{`${colors.b} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.b > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div
                  style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}
                  onClick={e => {
                    e.stopPropagation(); // чтобы не срабатывал клик по родителю
                    setIsOpenRGB(!isOpenRGB);
                  }}
                >
                  <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />
                </div>
              </div>
            </>
          )}
          {typeDriver === 98 && (
            <>
              <RGBWType value={colors} setValue={setColors} />
              <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'white'}
                    value={colors}
                    setValue={setColors}
                    field={'w'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.w > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, w: colors.w > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.w > 0 ? (
                      <div>{`${colors.w} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.w > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#ff113a'}
                    value={colors}
                    setValue={setColors}
                    field={'r'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.r > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, r: colors.r > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.r > 0 ? (
                      <div>{`${colors.r} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.r > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#26ff43'}
                    value={colors}
                    setValue={setColors}
                    field={'g'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.g > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, g: colors.g > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.g > 0 ? (
                      <div>{`${colors.g} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.g > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#0466FF'}
                    value={colors}
                    setValue={setColors}
                    field={'b'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.b > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, b: colors.b > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.b > 0 ? (
                      <div>{`${colors.b} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.b > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>

                <div
                  style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}
                  onClick={e => {
                    e.stopPropagation(); // чтобы не срабатывал клик по родителю
                    setIsOpenRGB(!isOpenRGB);
                  }}
                >
                  <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />
                </div>
              </div>
            </>
          )}
          {typeDriver === 128 && (
            <>
              <RGBTWType value={colors} setValue={setColors} />
              <div className={`${styles.rgbPanel} ${isOpenRGB ? styles.open : ''}`}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#cbe9fd'}
                    toColor={'#fef7cb'}
                    value={colors}
                    setValue={setColors}
                    field={'light'}
                    minValue={2000}
                    maxValue={6000}
                  />
                  <div className={styles.buttonOnOff} style={{ visibility: 'hidden' }}>
                    <ButtonOnOff />
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#ff113a'}
                    value={colors}
                    setValue={setColors}
                    field={'r'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.r > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, r: colors.r > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.r > 0 ? (
                      <div>{`${colors.r} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.r > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#26ff43'}
                    value={colors}
                    setValue={setColors}
                    field={'g'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.g > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, g: colors.g > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.g > 0 ? (
                      <div>{`${colors.g} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.g > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%' }}>
                  <ColorSlider
                    fromColor={'#0466FF'}
                    value={colors}
                    setValue={setColors}
                    field={'b'}
                  />
                  <div
                    className={styles.buttonOnOff}
                    style={colors.b > 0 ? { border: ' 2px solid #ffffff' } : {}}
                    onClick={() => {
                      setColors(prevState => ({ ...prevState, b: colors.b > 0 ? 0 : 100 }));
                    }}
                  >
                    {colors.b > 0 ? (
                      <div>{`${colors.b} %`}</div>
                    ) : (
                      <ButtonOnOff color={colors.b > 0 ? 'white' : 'grey'} />
                    )}
                  </div>
                </div>

                <div
                  style={{ position: 'absolute', backgroundColor: '#525252', bottom: 0, left: 0 }}
                  onClick={e => {
                    e.stopPropagation(); // чтобы не срабатывал клик по родителю
                    setIsOpenRGB(!isOpenRGB);
                  }}
                >
                  <DoubleArrowTopIcon width={30} height={20} gap={0} isOpen={isOpenRGB} />
                </div>
              </div>
            </>
          )}

          {/*Не показывать стрелку разворота*/}
          {typeDriver !== 4 && typeDriver !== 7 && (
            <div
              style={{ position: 'absolute', backgroundColor: '#525252' }}
              onClick={() => setIsOpenRGB(true)}
            >
              <DoubleArrowTopIcon
                width={30}
                height={20}
                gap={0}
                isOpen={isOpenRGB}
                // onClick={() => setIsOpenRGB(!isOpenRGB)}
              />
            </div>
          )}
        </div>
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
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
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
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
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
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
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
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                    />
                  </div>
                </div>
                <div className={styles.element}>
                  <div className={styles.valueName}>Плавное вкл/выкл</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                    />
                  </div>
                </div>
                <div className={styles.element}>
                  <div className={styles.valueName}>Шаг димирования</div>
                  <div className={styles.valueWrapper}>
                    <ArrowIcon
                      direction={'right'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                    />
                    <div className={styles.value}>12</div>
                    <ArrowIcon
                      direction={'left'}
                      double={false}
                      width={isMobile340 ? 28 : 32}
                      height={isMobile340 ? 28 : 32}
                    />
                  </div>
                </div>
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
          </div>
        </div>
      </div>
      {/*//КНОПКИ управления*/}
      <div className={styles.wrapperBtn}>
        {isLoading ? (
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
              <SpeakerIcon height={isMobile400 ? 52 : 56} width={isMobile400 ? 52 : 56} />
            </div>

            <AroundIcon
              height={isMobile400 ? 52 : 56}
              width={isMobile400 ? 52 : 56}
              className={shouldAnimate ? styles.spin : ''}
              color={state.value.socketStatus === 'connected' ? '#1FFF1B' : '#FF2A16'}
            />
            <Button text="Обновить" onClick={() => {}} />
            <Button text="Поиск " onClick={() => {}} />
          </>
        )}
      </div>
    </div>
  );
}
