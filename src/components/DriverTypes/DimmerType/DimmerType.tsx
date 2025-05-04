import { h } from 'preact';
import styles from './styles.module.scss';
import { SpeakerIcon } from '../../IconComponent/BackIcon/BackIcon';
import { ButtonOnOff } from '../../IconComponent/ButtonOnOff/ButtonOnOff';
import { ColorState } from '../../../pages/DeviceCard/DeviceCardPage';

interface DimmerTypeProps {
  value: ColorState;
  setValue: React.Dispatch<
    React.SetStateAction<{
      generalRange: number;
      r: number;
      g: number;
      b: number;
      w: number;
      light: number;
    }>
  >;
}

export const DimmerType = ({ value, setValue }: DimmerTypeProps) => {
  return (
    <div className={styles.sliderItem}>
      <div
        className={styles.buttonOnOff}
        style={value.generalRange > 0 ? { border: ' 2px solid #ffffff' } : {}}
        onClick={() => {
          setValue(prevState => ({
            ...prevState,
            generalRange: prevState.generalRange > 0 ? 0 : 100,
          }));
        }}
      >
        <ButtonOnOff color={value.generalRange > 0 ? 'white' : 'grey'} />
      </div>
    </div>
  );
};
