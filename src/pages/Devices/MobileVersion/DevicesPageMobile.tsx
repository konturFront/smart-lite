import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { sendMessageSocket, setTestingDriverAddress, state, stateUI } from '../../../store/store';
import { useLocation } from 'preact-iso';
import { DriverPreview } from '../../../components/DriverPreview/DriverPreview';
import stylesMobile from './stylesMobile.module.scss';
import { Button } from '../../../components/Button/Button';
import { ArrowIcon } from '../../../components/ArrowAction/ArrowAction';
import { h } from 'preact';
import { LoadingDots } from '../../../components/Loader/LoadingDots';
import styles from '../../Rooms/MobileVersion/stylesMobile.module.scss';
import { Modal } from '../../../components/Modal/Modal';
import { delay } from 'rxjs';
import { delayPreact } from '../../../utils/delay';
import { RoomCarousel } from '../../../components/Carousel/Carousel';
import { Loader } from '../../../components/Loader/Loader';
import { DoubleArrowIcon } from '../../../components/ArrowAction/DoubleArrowIcon';

export function DevicesPageMobile() {
  const refTest = useRef<HTMLDivElement>(null);
  const { route } = useLocation();
  const [isOpenModalSearch, setOpenModalSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [countPages, setCountPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const isLoading = stateUI.value.isLoadingUI;

  const handleUpdateDrivers = useCallback(() => {
    setOpenModalSearch(true);
  }, []);

  const updateDrivers = useCallback(() => {
    sendMessageSocket({ driver: 'update', cmd: 'start' });
  }, []);

  const startTestDriver = async (address: number) => {
    if (state.value.testingDriverAddress === address) {
      stopTestDriver();
      return;
    }
    if (state.value.testingDriverAddress !== undefined) {
      stopTestDriver();
      await delayPreact(500);
      sendMessageSocket({ driver: 'test', cmd: 'start', addres: +address }, false);
      setTestingDriverAddress(Number(address));
    } else {
      sendMessageSocket({ driver: 'test', cmd: 'start', addres: +address }, false);
      setTestingDriverAddress(Number(address));
    }
  };

  const stopTestDriver = () => {
    if (state.value.testingDriverAddress === undefined) return;
    sendMessageSocket(
      { driver: 'test', cmd: 'stop', addres: +state.value.testingDriverAddress },
      false
    );
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
          <DoubleArrowIcon direction={'right'} />
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
          <DoubleArrowIcon direction={'left'} />
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
        {isLoading ? (
          <div className={stylesMobile.loadingText}>
            <LoadingDots />
          </div>
        ) : (
          <>
            {/*<Loader />*/}
            <Button text="Обновить" onClick={updateDrivers} />
            <Button text="Поиск " onClick={handleUpdateDrivers} />
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
                  sendMessageSocket({ driver: 'find', cmd: 'start' });
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
