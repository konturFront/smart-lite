import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  addGroupItem,
  addRoom,
  deleteGroup,
  deleteRoom,
  editGroupName,
  sendMessageSocket,
  state,
} from '../../../store/store';
import { useLocation } from 'preact-iso';
import styles from './stylesMobile.module.scss';
import { Modal } from '../../../components/Modal/Modal';
import { useCalculateItemsPerPage } from '../../../hooks/useCalculateItemsPerPage';
import { GroupPreview } from '../../../components/GroupPreview/GroupPreview';
import { Button } from '../../../components/Button/Button';
import { RoomCarousel } from '../../../components/Carousel/Carousel';
import { nanoid } from 'nanoid';
import stylesMobile from '../../Home/MobileVersion/stylesMobile.module.scss';
import { ArrowIcon } from '../../../components/ArrowAction/ArrowAction';
import { h } from 'preact';

export const RoomsPageMobile = () => {
  const refTest = useRef<HTMLDivElement>(null);
  const { route } = useLocation();
  const [page, setPage] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [countPages, setCountPages] = useState(1);
  const [countElementForPages, setCountElementForPages] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupsSelectRoom = state.value?.rooms?.[activeIndex]?.groups;
  const [isAddGroupModal, setIsAddGroupModal] = useState(false);
  const [isAddRoomModal, setIsAddRoomModal] = useState(false);
  const [isDeleteRoomModal, setIsDeleteRoomModal] = useState(false);
  const [isEditGroupModal, setIsEditGroupModal] = useState();
  const selectRoom = state.value?.rooms?.[activeIndex];
  const [renameValue, setRenameValue] = useState('');

  const { itemsPerPage } = useCalculateItemsPerPage(refTest);
  const isOpenModal = isAddGroupModal || isDeleteRoomModal || isAddRoomModal || !!isEditGroupModal;
  const _dualPrimaryButtonText = isDeleteRoomModal
    ? 'Удалить'
    : isAddGroupModal || isAddRoomModal
      ? 'Cоздать'
      : !!isEditGroupModal
        ? 'Редактировать'
        : 'Удалить';
  const _dualSecondaryButtonText =
    isDeleteRoomModal || isAddRoomModal || isAddGroupModal
      ? 'Отмена'
      : !!isEditGroupModal
        ? 'Удалить'
        : 'Error';

  const _dualPrimaryButtonAction = () => {
    if (isAddRoomModal && renameValue?.length > 0) {
      createRoom(renameValue);
    }
    if (isDeleteRoomModal) {
      deleteRoom(selectRoom?.idRoom);
      setActiveIndex(0);
    }
    if (isAddGroupModal && renameValue?.length > 0) {
      const idRoom = selectRoom.idRoom;
      addGroupItem(idRoom, renameValue);
    }

    if (isEditGroupModal && renameValue?.length > 0) {
      const idRoom = selectRoom?.idRoom;
      const idGroup = isEditGroupModal?.idGroup;
      editGroupName(idRoom, idGroup, renameValue);
    }
    onCloseModal();
  };

  const _dualSecondaryButtonAction = () => {
    const idRoom = selectRoom?.idRoom;
    const idGroup = isEditGroupModal?.idGroup;
    if (isEditGroupModal) {
      deleteGroup(idRoom, idGroup);
    }
    onCloseModal();
  };

  const onCloseModal = () => {
    setRenameValue(undefined);
    setIsDeleteRoomModal(false);
    setIsAddGroupModal(false);
    setIsAddRoomModal(false);
    setIsEditGroupModal(undefined);
    setRenameValue(undefined);
  };

  useEffect(() => {
    sendMessageSocket({ rooms: 'search', cmd: 'start' }, false);
  }, []);

  useEffect(() => {
    scrollToActive();
  }, [activeIndex]);

  useEffect(() => {
    // 1) Если нет драйверов вообще, сбрасываем всё

    if (!groupsSelectRoom) {
      setCurrentItems([]);
      setCountPages(1);
      setCountElementForPages(0);
      return;
    }

    const allItems = [...groupsSelectRoom];
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
  }, [groupsSelectRoom, page, itemsPerPage]);

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

  const createRoom = useCallback((str?: string) => {
    const obj = { idRoom: `${nanoid()}`, roomName: `${str}`, drivers: {} };
    addRoom(obj);
  }, []);

  return (
    <div className={styles.devices}>
      <div
        className={styles.wrapperBtn}
        style={{ padding: '0  0 20px 0', borderBottom: '1px solid #ddd' }}
      >
        <Button
          text="Удалить"
          onClick={() => {
            if (state.value?.rooms?.length > 0) {
              setIsDeleteRoomModal(true);
            }
          }}
        />
        <Button
          text="Cоздать"
          onClick={() => {
            setIsAddRoomModal(true);
          }}
        />
      </div>
      <RoomCarousel
        rooms={state.value?.rooms || []}
        activeIndex={activeIndex}
        onItemClick={setActiveIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        sx={{ margin: '20px 0 10px 0' }}
      />
      <div
        className={styles.wrapperBtn}
        style={{ justifyContent: 'flex-end', marginBottom: '20px' }}
      >
        <Button
          text="Создать группу"
          onClick={() => {
            setIsAddGroupModal(true);
          }}
        />
      </div>
      <div id="drivers-list" className={styles.driversList} ref={refTest}>
        {currentItems.map((item, index) => {
          return (
            <GroupPreview
              key={item.idGroup}
              onContextMenu={e => e.preventDefault()}
              name={item.groupName}
              address={index}
              onClickPencil={() => {
                setIsEditGroupModal(item);
                setRenameValue(item.groupName);
                // route(`/service/devices/${driver[0]}`);
              }}
              onClick={() => {
                // route(`/service/devices/${driver[0]}`);
              }}
            />
          );
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

      <Modal
        maxWidth="md"
        open={isOpenModal}
        onClose={onCloseModal}
        buttonsType="dual"
        dualPrimaryButtonText={_dualPrimaryButtonText}
        dualPrimaryButtonAction={_dualPrimaryButtonAction}
        dualSecondaryButtonAction={_dualSecondaryButtonAction}
        dualSecondaryButtonText={_dualSecondaryButtonText}
      >
        {isDeleteRoomModal && (
          <>
            <div
              className={styles.title}
            >{`Вы точно хотите удалить помещение "${selectRoom?.roomName}"`}</div>
            <label className={styles.field}></label>
          </>
        )}
        {!!isEditGroupModal && (
          <>
            <div className={styles.title}>{`Редактирование группы`}</div>
            <label className={styles.field}>
              <input
                autoComplete="off"
                type="text"
                className={styles.input}
                id="room-name"
                value={renameValue}
                onInput={e => setRenameValue((e.target as HTMLInputElement).value)}
              />
            </label>
          </>
        )}
        {!!isAddGroupModal && (
          <>
            <div
              className={styles.title}
            >{`Cоздать группу в помещении "${selectRoom.roomName}"`}</div>
            <label className={styles.field}>
              <input
                placeholder={'Название группы'}
                autoComplete="off"
                type="text"
                className={styles.input}
                id="room-name"
                value={renameValue}
                onInput={e => setRenameValue((e.target as HTMLInputElement).value)}
              />
            </label>
          </>
        )}
        {!!isAddRoomModal && (
          <>
            <div className={styles.title}>{`Cоздать помещение`}</div>
            <label className={styles.field}>
              <input
                placeholder={'Название помещения'}
                autoComplete="off"
                type="text"
                className={styles.input}
                id="room-name"
                value={renameValue}
                onInput={e => setRenameValue((e.target as HTMLInputElement).value)}
              />
            </label>
          </>
        )}
      </Modal>
    </div>
  );
};
