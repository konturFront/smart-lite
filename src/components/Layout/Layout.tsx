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

  // Каждые 3секундны опрашиваем статус занял или нет
  // Если занят блокируем showloading

  useEffect(() => {
    // 1) Подписываемся на все входящие сообщения от сокета
    const unsubscribe = socketService.onMessage(data => {
      if (data === 'free') {
        stateUI.value = { ...stateUI.value, isLoadingUI: false };
      }
      if (data === 'busy') {
        stateUI.value = { ...stateUI.value, isLoadingUI: true };
      }
    });

    // 2) Запускаем интервал, который раз в 3 секунды шлёт запрос «status»
    const intervalId = window.setInterval(() => {
      socketService.send('status');
    }, 3000);

    // 3) При анмаунте — отписка и очистка интервала
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

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
