import { useEffect } from 'preact/hooks';
import { socketService } from '../../service/ws/socketService';
import { Header } from '../Header/Header';
import { Wrapper } from '../Wrapper/Wrapper';
import { state } from '../../store/store';
import styles from './styles.module.scss';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
export const Layout = ({ children }: { children?: preact.ComponentChildren }) => {
  const { isMobile, isMobile1100 } = useDeviceDetect();
  useEffect(() => {
    socketService.connect(state.value.socketURL);
    return () => {
      socketService.disconnect();
    };
  }, []);

  if (isMobile1100) {
    return (
      <div>
        <Header />
        <Wrapper>{children}</Wrapper>
      </div>
    );
  }

  if (!isMobile) {
    return <div style={{ fontSize: '40px' }}>Only Mobile Version</div>;
  }
};
