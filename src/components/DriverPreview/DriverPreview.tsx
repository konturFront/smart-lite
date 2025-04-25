import { h, JSX } from 'preact';
import styles from './styles.module.scss';
import { LedIndicator } from '../IconComponent/LedIndicator/LedIndicator';
import { Rele } from '../IconComponent/Rele/Rele';
import { GroupIcon } from '../Group/GroupIcon';
import { Button } from '../Button/Button';
import { LightBulbIcon } from '../IconComponent/LightBulbIcon/LightBulbIcon';

type Props = {
  address: string;
  type: string;
  onClickSettings?: () => void;
  onClickTest?: () => void;
  editPencil?: boolean;
  lampVisible?: boolean;
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

export function DriverPreview({
  address,
  editPencil = false,
  type,
  onClick,
  onClickTest,
  onClickSettings,
  lampVisible,
  ...rest
}: Props) {
  const colors = lampColorsMap[`${type}`];

  return (
    <div className={`${styles.container}`} {...rest}>
      <span className={styles.channelNumber}>{address}</span>
      <div className={styles.indicators}>
        {Array.isArray(colors) &&
          colors.map((color, index) => (
            <span key={color + index} className={`${styles.dot} ${styles[color]}`} />
          ))}
        {colors === 'triangleWithLed' && <LedIndicator led={true} />}
        {colors === 'triangle' && <LedIndicator led={false} />}
        {colors === 'rele' && <Rele size={56} strokeWidth={5} />}
        {colors === 'group' && <GroupIcon />}
      </div>
      <Button
        text="Настройки"
        sx={{ padding: '9px 7px' }}
        onClick={event => {
          onClickSettings();
          event.stopPropagation();
        }}
      />
      <Button
        text="Тест"
        lampVisible={lampVisible}
        sx={{ padding: '9px 7px' }}
        onClick={event => {
          onClickTest?.();
          event.stopPropagation();
        }}
      />
    </div>
  );
}
