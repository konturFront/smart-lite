import { useEffect } from 'preact/hooks';
import { socketService } from '../../service/ws/socketService';
import { Header } from '../Header/Header';
import { Wrapper } from '../Wrapper/Wrapper';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { state, stateUI } from '../../store/initialState';
import { Loader } from '../Loader/Loader';
import { ToastProvider } from '../Toast/Toast';
import styles from './styles.module.scss';
import { sendMessageSocket } from '../../store/store';

export const Layout = ({ children }: { children?: preact.ComponentChildren }) => {
  const { isMobile, isMobile1100 } = useDeviceDetect();

  useEffect(() => {
    socketService.connect(state.value.socketURL);
    return () => {
      socketService.disconnect();
    };
  }, []);

  //Каждые 30 шлем сообщение для того чтобы сокет не закрылся
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     sendMessageSocket('Connected', false);
  //   }, 30000);
  //
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  if (true) {
    return (
      <div className={styles.layoutContainer}>
        <Header />
        <Wrapper>{children}</Wrapper>
        <ToastProvider />
        {/*{stateUI.value.isLoadingUI && <Loader />}*/}
      </div>
    );
  }

  // if (!isMobile) {
  //   return <div style={{ fontSize: '40px' }}>Only Mobile Version</div>;
  // }
};
