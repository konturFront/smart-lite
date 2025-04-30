import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
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

export const ColorSlider = ({
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
      const val = value[field];
      const percent = ((val - min) / (max - min)) * 100;
      sliderRef.current.style.setProperty('--value', `${percent}%`);
      sliderRef.current.style.setProperty('--track-from', fromColor);
      sliderRef.current.style.setProperty('--track-to', toColor);
    }
  }, [value, fromColor, toColor, field]);

  const handleInput = (e: Event) => {
    const newValue = Number((e.target as HTMLInputElement).value);
    setValue(prev => ({ ...prev, [field]: newValue }));
  };

  return (
    <div className={styles.sliderItem}>
      <input
        ref={sliderRef}
        type="range"
        min={minValue ?? 0}
        max={maxValue ?? 100}
        value={value[field]}
        onInput={handleInput}
      />
      {/*<span className={styles.sliderValue}>{value}%</span>*/}
    </div>
  );
};
