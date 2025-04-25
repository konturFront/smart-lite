import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { sendMessageSocket, state } from '../../../store/store';
import { useLocation } from 'preact-iso';
import { DriverPreview } from '../../../components/DriverPreview/DriverPreview';
import stylesMobile from './stylesMobile.module.scss';
import { Modal } from '../../../components/Modal/Modal';
import { useCalculateItemsPerPage } from '../../../hooks/useCalculateItemsPerPage';
import { RoomCarousel } from '../../../components/Carousel/Carousel';
import { ArrowIcon } from '../../../components/IconComponent/ArrowAction/ArrowAction';
import { h } from 'preact';

export function HomePageMobile() {
  const refTest = useRef<HTMLDivElement>(null);
  const { route } = useLocation();
  const [page, setPage] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [countPages, setCountPages] = useState(1);
  const [countElementForPages, setCountElementForPages] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const driversSelectRoom = state.value?.rooms?.[activeIndex]?.drivers;
  const [isAddRoomModal, setIsAddRoomModal] = useState(false);
  const selectRoom = state.value?.rooms?.[activeIndex];
  const groupsSelectRoom = selectRoom?.groups;

  const { itemsPerPage } = useCalculateItemsPerPage(refTest);

  useEffect(() => {
    sendMessageSocket({ rooms: 'search', cmd: 'start' }, false);
  }, []);

  useEffect(() => {
    scrollToActive();
  }, [activeIndex]);

  useEffect(() => {
    // 1) Если нет драйверов вообще, сбрасываем всё
    if (!driversSelectRoom) {
      setCurrentItems([]);
      setCountPages(1);
      return;
    }

    // 2) Собираем список групп (если есть)
    const groupList =
      groupsSelectRoom?.map(group => ({
        id: group.idGroup,
        type: 'group' as const,
        driverAddresses: group.driverAddresses,
        groupName: group.groupName,
      })) || [];

    // 3) Берём "свободные" драйверы — вся логика проверки не нужна,
    //    т. к. тут уже лежат только свободные (не входящие в группы).
    const driverKeys = Object.keys(driversSelectRoom);
    const freeDrivers = driverKeys.map(key => ({
      id: key,
      type: 'drivers' as const,
      data: driversSelectRoom[key], // например [18,7]
    }));

    // 4) Если редактируем группу, добавляем ЕЁ драйверы к "freeDrivers".
    let finalDrivers = freeDrivers;

    // 5) Общий массив: сначала группы, потом драйверы
    const allItems = [...groupList, ...finalDrivers];
    setCountElementForPages(allItems?.length ?? 0);

    // 6) Пагинация
    if (allItems.length > 0) {
      const totalPages = Math.ceil(allItems.length / itemsPerPage);
      setCountPages(totalPages);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setCurrentItems(allItems.slice(startIndex, endIndex));
    } else {
      setCurrentItems([]);
      setCountPages(1);
    }
  }, [driversSelectRoom, groupsSelectRoom, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [activeIndex]);

  // Эта функция будет прокручивать контейнер так,
  // чтобы активная комната оказалась по центру
  const scrollToActive = () => {
    const container = containerRef.current;
    if (!container || !container.children.length) return;
    const activeItem = container.children[activeIndex] as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    const scrollOffset =
      activeRect.left + activeRect.width / 2 - (containerRect.left + containerRect.width / 2);
    container.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  // Обработчик нажатия на стрелку "назад"
  const handlePrev = useCallback(() => {
    setActiveIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => Math.min(prev + 1, state.value.rooms.length - 1));
  }, [state.value.rooms]);

  return (
    <div className={stylesMobile.devices}>
      <RoomCarousel
        rooms={state.value?.rooms || []}
        activeIndex={activeIndex}
        onItemClick={setActiveIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        sx={{ margin: '20px 0' }}
      />
      <div id="drivers-list" className={stylesMobile.driversList} ref={refTest}>
        {currentItems.map(item => {
          if (item?.type === 'group') {
            return (
              <DriverPreview
                key={item.id}
                name={`${item.groupName}`}
                type={'group'}
                address={''}
                onContextMenu={e => e.preventDefault()}
              />
            );
          }

          if (item?.type === 'drivers') {
            const driver = item.data;
            return driver ? (
              <DriverPreview
                key={driver[0]}
                name={'Контейнер Контейнер'}
                type={driver[1]}
                address={driver[0]}
                onClick={() => {
                  route(`/service/devices/${driver[0]}`);
                }}
              />
            ) : null;
          }
        })}
      </div>
      {/*ПАГИНАЦИЯ*/}
      <div className={stylesMobile.paginationBar}>
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

        <div className={stylesMobile.totalCount}>{countElementForPages}</div>
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

      <Modal open={isAddRoomModal} onClose={() => setIsAddRoomModal(false)} maxWidth="md">
        <div className={stylesMobile.modalContainer}>
          <button className={stylesMobile.closeBtn} onClick={() => setIsAddRoomModal(false)}>
            &times;
          </button>

          <h2 className={stylesMobile.title}>Добавить группу:</h2>

          <label className={stylesMobile.field}>
            <span className={stylesMobile.fieldLabel}>Создать группу</span>
            <input
              autoComplete="off"
              type="text"
              id="wifi-password"
              className={stylesMobile.input}
            />
          </label>

          <div className={stylesMobile.actions}>
            <button className={stylesMobile.buttonCancel} onClick={() => setIsAddRoomModal(false)}>
              Отмена
            </button>
            <button className={stylesMobile.buttonConfirm}>Да</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
