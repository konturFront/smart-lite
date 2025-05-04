import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import styles from './styles.module.scss';
import { ColorState } from '../../pages/DeviceCard/DeviceCardPage';

interface ColorSliderProps {
  fromColor?: string; // цвет до ползунка
  toColor?: string; // цвет после ползунка
  maxValue?: number;
  minValue?: number;
  value: ColorState;
  field: keyof ColorState;
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

export const ColorSliderGeneral = ({
  fromColor = '#ff4757',
  toColor = '#525252',
  value,
  setValue,
  maxValue,
  minValue,
  field,
}: ColorSliderProps) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const min = minValue ?? 0;
      const max = maxValue ?? 100;
      const val = value.generalRange;
      const percent = ((val - min) / (max - min)) * 100;
      if (percent > 0) {
        sliderRef.current.style.setProperty('--thumb-color', '#f7e13e'); // яркий жёлтый
      } else {
        sliderRef.current.style.setProperty('--thumb-color', '#424242'); // серый (по умолчанию)
      }
      sliderRef.current.style.setProperty('--value', `${percent}%`);
      sliderRef.current.style.setProperty('--track-from', fromColor);
      sliderRef.current.style.setProperty('--track-to', toColor);
    }
  }, [value]);

  const handleInput = (e: Event) => {
    const newValue = Number((e.target as HTMLInputElement).value);
    setValue(prev => ({ ...prev, generalRange: newValue }));
  };

  return (
    <div className={styles.sliderItem}>
      <span className={styles.sliderValue}>{value.generalRange}%</span>

      <input
        ref={sliderRef}
        type="range"
        min={minValue ?? 0}
        max={maxValue ?? 100}
        value={value.generalRange}
        onInput={handleInput}
      />
    </div>
  );
};
