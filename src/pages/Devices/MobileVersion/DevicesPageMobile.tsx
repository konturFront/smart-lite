import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { DriverPreview } from '../../../components/DriverPreview/DriverPreview';
import stylesMobile from './stylesMobile.module.scss';
import { Button } from '../../../components/Button/Button';
import { h } from 'preact';
import { LoadingDots } from '../../../components/Loader/LoadingDots';
import styles from '../../Rooms/MobileVersion/stylesMobile.module.scss';
import { Modal } from '../../../components/Modal/Modal';
import { delayPreact } from '../../../utils/delay';
import { ArrowIcon } from '../../../components/IconComponent/ArrowAction/ArrowIcon';
import { AroundIcon } from '../../../components/IconComponent/AroundIcon/AroundIcon';
import { useDeviceDetect } from '../../../hooks/useDeviceDetect';
import {
  findDeepDrivers,
  sendMessageSocket,
  setTestingDriverAddress,
  startTestDriverWithRetry,
  updateDriversWithRetry,
} from '../../../store/store';
import { state, stateUI } from '../../../store/initialState';
import { SpeakerIcon } from '../../../components/IconComponent/BackIcon/BackIcon';
import { ButtonNavigation } from '../../../components/ButtonNavigation/ButtonNavigation';

export function DevicesPageMobile() {
  const refTest = useRef<HTMLDivElement>(null);
  const { route } = useLocation();
  const [isOpenModalSearch, setOpenModalSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [countPages, setCountPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const { isMobile340, isMobile380, isMobile400 } = useDeviceDetect();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const isLoading = stateUI.value.isLoadingUI;
  const socketStatus = state.value.socketStatus;

  const handleUpdateDrivers = useCallback(() => {
    setOpenModalSearch(true);
  }, []);

  const updateDrivers = useCallback(() => {
    updateDriversWithRetry();
  }, []);

  const startTestDriver = async (address: number) => {
    if (state.value.testingDriverAddress === address) {
      stopTestDriver();
      return;
    }
    if (state.value.testingDriverAddress !== undefined) {
      stopTestDriver();
      await delayPreact(500);
      startTestDriverWithRetry({ driver: 'test', cmd: 'start', addres: +address });
      setTestingDriverAddress(Number(address));
    } else {
      startTestDriverWithRetry({ driver: 'test', cmd: 'start', addres: +address });
      setTestingDriverAddress(Number(address));
    }
  };

  const stopTestDriver = () => {
    if (state.value.testingDriverAddress === undefined) return;
    startTestDriverWithRetry({
      driver: 'test',
      cmd: 'stop',
      addres: +state.value.testingDriverAddress,
    });
    setTestingDriverAddress(undefined);
  };

  // Вычисляем, сколько драйверов влезает по высоте
  useEffect(() => {
    if (refTest.current) {
      const totalHeight = refTest.current.getBoundingClientRect().height;
      const driverHeight = 60;
      const gap = 16;
      const paddingTop = 20;
      const visibleItems = Math.round((totalHeight - paddingTop + gap) / (driverHeight + gap));
      const calculated = Math.max(1, visibleItems);
      setItemsPerPage(calculated);
    }
  }, [refTest.current]);

  // Считаем страницы и текущий срез
  useEffect(() => {
    const arr = Object.keys(state.value.updatedDevices);

    if (arr.length > 0) {
      const _countPages = Math.ceil(arr.length / itemsPerPage);
      setCountPages(_countPages);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const sliced = arr.slice(startIndex, endIndex);
      setCurrentItems(sliced);
    } else {
      setCurrentItems([]);
      setCountPages(1);
    }
  }, [state.value.updatedDevices, page, itemsPerPage]);

  useEffect(() => {
    return () => {
      stopTestDriver();
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

  const totalDrivers = Object.keys(state.value.updatedDevices).length;
  return (
    <div className={stylesMobile.devices}>
      <div id={'line'} className={stylesMobile.line}></div>
      <div id="drivers-list" className={stylesMobile.driversList} ref={refTest}>
        {currentItems.map(key => (
          <DriverPreview
            key={state.value.updatedDevices[key][0]}
            lampVisible={+state.value.updatedDevices[key][0] === state.value.testingDriverAddress}
            type={state.value.updatedDevices[key][1]}
            address={state.value.updatedDevices[key][0]}
            onClickSettings={() => route(`/service/devices/${state.value.updatedDevices[key][0]}`)}
            onClickTest={() => {
              startTestDriver(+state.value.updatedDevices[key][0]);
            }}
          />
        ))}
      </div>
      {/*ПАГИНАЦИЯ*/}
      <div className={stylesMobile.paginationBar2}>
        <div
          style={{
            marginRight: '5px',
            visibility: page === 1 ? 'hidden' : 'visible',
            fontSize: '38px',
            left: '0',
            // top: '0',
          }}
          className={stylesMobile.arrowPagination}
          onClick={() => setPage(p => Math.max(p - 1, 1))}
        >
          <ArrowIcon direction={'right'} />
        </div>
        <div
          style={{
            marginLeft: '5px',
            visibility: page === countPages ? 'hidden' : 'visible',
            fontSize: '38px',
            right: '0',
            // top: '0',
          }}
          className={stylesMobile.arrowPagination}
          onClick={() => setPage(p => Math.min(p + 1, countPages))}
        >
          <ArrowIcon direction={'left'} />
        </div>

        <div className={stylesMobile.totalCount}>{totalDrivers}</div>
        <div className={stylesMobile.dotsWrapper}>
          {countPages > 0 && (
            <div className={stylesMobile.dots}>
              {Array.from({ length: countPages }).map((_, index) => (
                <span
                  key={index}
                  className={`${stylesMobile.dot} ${page === index + 1 ? stylesMobile.active : ''}`}
                  onClick={() => setPage(index + 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={stylesMobile.wrapperBtn}>
        {isLoading && socketStatus === 'connected' ? (
          <div className={stylesMobile.loadingText}>
            <LoadingDots />
          </div>
        ) : (
          <>
            <div
              style={{ visibility: 'hidden' }}
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
              color={state.value.socketStatus === 'connected' ? '#1FFF1B' : '#FF2A16'}
            />
            <ButtonNavigation text="Обновить" onClick={updateDrivers} />
            <ButtonNavigation text="Поиск " onClick={handleUpdateDrivers} />
          </>
        )}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                text="Новый поиск"
                onClick={() => {
                  findDeepDrivers();
                  setOpenModalSearch(false);
                }}
              />
              <span style={{ marginTop: '10px' }}>Все адреса и настройки будут удалены</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                text="Добавить новый драйвер"
                onClick={() => {
                  updateDrivers();
                  setOpenModalSearch(false);
                }}
              />
              <span style={{ marginTop: '10px' }}>Все адреса и настройки будут сохранены</span>
            </div>
          </div>
        </>
      </Modal>
    </div>
  );
}
