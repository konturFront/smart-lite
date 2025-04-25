import { h } from 'preact';
import styles from './styles.module.scss';

type IProps = {
  led?: boolean;
};

export function LedIndicator({ led }: IProps) {
  return (
    <div className={styles.container}>
      {led && <span className={styles.label}>LED</span>}
      <div className={styles.triangle} />
    </div>
  );
}
