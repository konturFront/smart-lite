import { h, JSX } from 'preact';
import styles from './styles.module.scss';
import { LedIndicator } from '../IconComponent/LedIndicator/LedIndicator';
import { Rele } from '../IconComponent/Rele/Rele';
import { GroupIcon } from '../Group/GroupIcon';
import { EditIcon } from '../IconComponent/EditIcon/EditIcon';

type Props = {
  address: string | number;
  name: string;
  onClick?: () => void;
  onClickPencil?: () => void;
  editPencil?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

const lampColorsMap: Record<string, string[] | string> = {
  '2': ['warm', 'cold'],
  '4': 'triangle',
  '6': 'triangleWithLed',
  '7': 'rele',
  '96': ['red', 'green', 'blue'],
  '98': ['red', 'green', 'blue', 'white'],
  '128': ['red', 'green', 'blue', 'cold', 'warm'],
  group: 'group',
};

export function GroupPreview({
  address,
  editPencil = false,
  name = 'Комната спальная 12345678901234567890',
  onClick,
  onClickPencil,
  ...rest
}: Props) {
  return (
    <div className={`${styles.container}`} onClick={onClick} {...rest}>
      <span className={styles.channelNumber}>{address}</span>
      <div className={styles.indicators}>
        <GroupIcon />
      </div>
      <div className={styles.dashes}>
        <span className={styles.name}>{name}</span>
      </div>
      <div
        style={{ height: '100%', alignContent: 'center', padding: '0px 12px' }}
        onClick={event => {
          onClickPencil?.();
          event.stopPropagation();
        }}
      >
        <EditIcon />
      </div>
    </div>
  );
}
