import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import styles from './styles.module.scss';
import { ArrowIcon } from '../IconComponent/ArrowAction/ArrowAction';

interface RoomCarouselProps {
  rooms: Array<{ idRoom: string; roomName: string }>;
  activeIndex: number;
  onItemClick: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  sx?: React.CSSProperties;
}

export const RoomCarousel = ({
  rooms,
  activeIndex,
  onItemClick,
  onPrev,
  onNext,
  sx,
}: RoomCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    scrollToActive();
  }, [activeIndex]);

  return (
    <div className={styles.roomCarouselWrapper} style={sx}>
      {rooms?.length > 1 && (
        <div
          style={{
            fontSize: '38px',
            visibility: activeIndex === 0 ? 'hidden' : 'visible',
          }}
          className={styles.arrowPagination}
          onClick={onPrev}
        >
          <ArrowIcon direction={'right'} />
        </div>
      )}
      {rooms?.length > 0 ? (
        <div className={styles.roomCarousel} ref={containerRef}>
          {rooms?.map((room, index) => (
            <div
              key={room?.idRoom + index}
              className={`${styles.roomItem} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => onItemClick(index)}
            >
              {room?.roomName}
            </div>
          ))}
        </div>
      ) : (
        <div>{'Нет созданных групп'}</div>
      )}
      {rooms?.length > 1 && (
        <div
          style={{
            fontSize: '38px',
            visibility: activeIndex === rooms?.length - 1 ? 'hidden' : 'visible',
          }}
          className={styles.arrowPagination}
          onClick={onNext}
        >
          <ArrowIcon direction={'left'} />
        </div>
      )}
    </div>
  );
};
