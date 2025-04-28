import { useLocation, useRoute } from 'preact-iso';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { groupsToMasks, parseGroupMasks } from '../../utils/parseGroupMask';
import { sendMessageSocket, showLoadingStateUI, state, stateUI } from '../../store/store';
import { Button } from '../../components/Button/Button';
import { LoadingDots } from '../../components/Loader/LoadingDots';
import styles from './styles.module.scss';
import { h } from 'preact';
import stylesMobile from '../Devices/MobileVersion/stylesMobile.module.scss';
import { DriverPreview } from '../../components/DriverPreview/DriverPreview';
import { ArrowIcon } from '../../components/IconComponent/ArrowAction/ArrowIcon';
import { DoubleArrowTopIcon } from '../../components/IconComponent/DoubleArrowIcon/DoubleArrowTopIcon';
import classNames from 'classnames';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

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
  const { isMobile340 } = useDeviceDetect();
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
  console.log('tab', tab);
  return (
    <div className={styles.devices}>
      <div id={'line'} className={styles.line}></div>
      {/*<div className={styles.panel}>*/}
      {/*  <div className={styles.sliderWrapper}>*/}
      {/*    <div className={styles.sliderLabel}>Минимальный уровень яркости</div>*/}
      {/*    <div className={styles.sliderItem}>*/}
      {/*      <input*/}
      {/*        type="range"*/}
      {/*        min="1"*/}
      {/*        max="254"*/}
      {/*        value={minLevel}*/}
      {/*        onInput={e => setMinLevel(Number((e.target as HTMLInputElement).value))}*/}
      {/*      />*/}
      {/*      <span className={styles.sliderValue}>{minLevel}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.sliderWrapper}>*/}
      {/*    <div className={styles.sliderLabel}>Максимальный уровень яркости</div>*/}
      {/*    <div className={styles.sliderItem}>*/}
      {/*      <input*/}
      {/*        type="range"*/}
      {/*        min="1"*/}
      {/*        max="254"*/}
      {/*        value={maxLevel}*/}
      {/*        onInput={e => setMaxLevel(Number((e.target as HTMLInputElement).value))}*/}
      {/*      />*/}
      {/*      <span className={styles.sliderValue}>{maxLevel}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.sliderWrapper}>*/}
      {/*    <div className={styles.sliderLabel}>Уровень яркости при аварии</div>*/}
      {/*    <div className={styles.sliderItem}>*/}
      {/*      <input*/}
      {/*        type="range"*/}
      {/*        min="1"*/}
      {/*        max="254"*/}
      {/*        value={failureLevel}*/}
      {/*        onInput={e => setFailureLevel(Number((e.target as HTMLInputElement).value))}*/}
      {/*      />*/}
      {/*      <span className={styles.sliderValue}>{failureLevel}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.sliderWrapper}>*/}
      {/*    <div className={styles.sliderLabel}>Уровень яркости при подачи питания</div>*/}
      {/*    <div className={styles.sliderItem}>*/}
      {/*      <input*/}
      {/*        type="range"*/}
      {/*        min="1"*/}
      {/*        max="254"*/}
      {/*        value={poweronLevel}*/}
      {/*        onInput={e => setPoweronLevel(Number((e.target as HTMLInputElement).value))}*/}
      {/*      />*/}
      {/*      <span className={styles.sliderValue}>{poweronLevel}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.fadeControls}>*/}
      {/*    <div style={{ display: 'flex' }}>*/}
      {/*      <div className={styles.sliderLabel}> Время затухания (сек.):</div>*/}
      {/*      <div className={styles.sliderItem}>*/}
      {/*        <input*/}
      {/*          type="number"*/}
      {/*          value={fadeTime}*/}
      {/*          onInput={handleFadeTimeChange}*/}
      {/*          inputMode="numeric"*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*    <div style={{ display: 'flex' }}>*/}
      {/*      <div className={styles.sliderLabel}>Скорость затухания (шаг/сек.):</div>*/}
      {/*      <div className={styles.sliderItem}>*/}
      {/*        <input*/}
      {/*          type="number"*/}
      {/*          value={fadeRate}*/}
      {/*          onInput={handleFadeRateChange}*/}
      {/*          inputMode="numeric"*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.testSection}>*/}
      {/*    <div className={styles.sliderWrapper}>*/}
      {/*      <div className={styles.sliderLabel}>Текущий уровень яркости</div>*/}
      {/*      <div className={styles.sliderItem}>*/}
      {/*        <input type="range" min="0" max="100" value={currentLevel} onInput={updateDebounce} />*/}
      {/*        <span className={styles.sliderValue}>{currentLevel}</span>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.testSection}>*/}
      {/*    <div className={styles.sliderWrapper}>*/}
      {/*      <div className={styles.sliderLabel}>*/}
      {/*        Установки яркости на &nbsp;*/}
      {/*        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>всех</span> <br />*/}
      {/*        устройствах*/}
      {/*      </div>*/}
      {/*      <div className={styles.sliderItem}>*/}
      {/*        <input*/}
      {/*          type="range"*/}
      {/*          min="0"*/}
      {/*          max="100"*/}
      {/*          value={currentLevelAllDrivers}*/}
      {/*          onInput={updateDebounceAllDriversBright}*/}
      {/*        />*/}
      {/*        <span className={styles.sliderValue}>{currentLevelAllDrivers}</span>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={styles.groupSelect}>*/}
      {/*    <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Выбор групп</div>*/}
      {/*    <div className={styles.groups}>*/}
      {/*      {groups.map((isChecked, i) => (*/}
      {/*        <label key={i}>*/}
      {/*          <input type="checkbox" checked={isChecked} onChange={() => toggleGroup(i)} />*/}
      {/*          Группа {i}*/}
      {/*        </label>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div id="drivers-list" className={styles.content}>
        <div className={styles.sliderWrapper}>
          <div className={styles.sliderItem}>
            <span className={styles.sliderValue}>{`${minLevel ?? 0} %`}</span>
            <input
              type="range"
              min="1"
              max="254"
              value={minLevel}
              onInput={e => setMinLevel(Number((e.target as HTMLInputElement).value))}
            />
          </div>
          <div
            style={{ position: 'absolute', backgroundColor: '#525252' }}
            onClick={() => setIsOpenRGB(!isOpenRGB)}
          >
            <DoubleArrowTopIcon
              width={30}
              height={20}
              gap={0}
              isOpen={isOpenRGB}
              // onClick={() => setIsOpenRGB(!isOpenRGB)}
            />
          </div>
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
            {/*<Loader />*/}
            <Button text="Обновить" onClick={() => {}} />
            <Button text="Поиск " onClick={() => {}} />
          </>
        )}
      </div>
    </div>
  );
}
