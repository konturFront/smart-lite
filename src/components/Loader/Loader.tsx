import styles from './styles.module.scss';
import { h } from 'preact';
import classNames from 'classnames';

export const Loader = () => {
  return <div className={styles.spinner}></div>;
};

type Props = {
  count: number | string;
  searching: boolean;
};

export function DeviceSearchStatus({ count, searching }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.count}>
        <span className={styles.text}>Найдено</span> {count}
      </div>
      <div className={`${styles.bar} ${searching ? styles.active : ''}`} />
    </div>
  );
}
