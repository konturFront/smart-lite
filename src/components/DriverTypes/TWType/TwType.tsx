import { h } from 'preact';
import styles from './styles.module.scss';
import { SpeakerIcon } from '../../IconComponent/BackIcon/BackIcon';
import { ButtonOnOff } from '../../IconComponent/ButtonOnOff/ButtonOnOff';
import { ColorSlider } from '../../ColorSlider/ColorSlider';
import { ColorState } from '../../../pages/DeviceCard/DeviceCardPage';

interface TWTypeProps {
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

export const TWType = ({ value, setValue }: TWTypeProps) => {
  return (
    <div className={styles.sliderItem}>
      <span
        className={value.generalRange > 0 ? styles.sliderValue : styles.sliderValueInactive}
      >{`${value.generalRange} %`}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={value.generalRange}
        onInput={e =>
          setValue(prevState => ({
            ...prevState,
            generalRange: Number((e.target as HTMLInputElement).value),
          }))
        }
      />
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
