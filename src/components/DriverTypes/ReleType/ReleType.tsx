import { h } from 'preact';
import styles from './styles.module.scss';
import { ButtonOnOff } from '../../IconComponent/ButtonOnOff/ButtonOnOff';
import { ColorState } from '../../../pages/DeviceCard/DeviceCardPage';

interface RGBWTypeProps {
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
export const ReleType = ({ value, setValue }: RGBWTypeProps) => {
  return (
    <div className={styles.sliderItem}>
      {/*<span className={styles.sliderValue}>{`${value.generalRange ?? 0} %`}</span>*/}
      {/*<input*/}
      {/*  type="range"*/}
      {/*  min="0"*/}
      {/*  max="100"*/}
      {/*  value={value.generalRange}*/}
      {/*  onInput={e =>*/}
      {/*    setValue(prevState => ({*/}
      {/*      ...prevState,*/}
      {/*      generalRange: Number((e.target as HTMLInputElement).value),*/}
      {/*    }))*/}
      {/*  }*/}
      {/*/>*/}
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
