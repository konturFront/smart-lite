import { useEffect, useLayoutEffect } from 'preact/hooks';
import { socketService } from '../../service/ws/socketService';
import { Header } from '../Header/Header';
import { Wrapper } from '../Wrapper/Wrapper';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { state, stateUI } from '../../store/initialState';
import { Loader } from '../Loader/Loader';
import { ToastProvider, toastService } from '../Toast/Toast';
import styles from './styles.module.scss';
import {
  hideLoadingStateUIInterval,
  sendMessageSocket,
  setOnlineCountDrivers,
  showLoadingStateUIInterval,
} from '../../store/store';

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
      if (typeof data !== 'string') {
        return;
      }

      if (data === 'free') {
        hideLoadingStateUIInterval();
      }

      if (data === 'busy') {
        showLoadingStateUIInterval();
      }

      // поиск драйверов — формат "sfdN"
      if (data?.startsWith('sfd')) {
        const n = parseInt(data.slice(3), 10);
        showLoadingStateUIInterval();
        setOnlineCountDrivers(n);
      }

      // поиск сенсоров — формат "sfsN"
      if (data?.startsWith('sfs')) {
        const n = parseInt(data.slice(3), 10);
        showLoadingStateUIInterval();
        setOnlineCountDrivers(n);
      }

      // // на всякий случай: если ни один из вариантов не сработал и это не чистый "free"
      // if (data !== 'free' && !data?.startsWith('sfd') && !data?.startsWith('sfs')) {
      //   showLoadingStateUIInterval();
      //   toastService.showError(`Неизвестный статус ${data}`);
      // }
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

  useEffect(() => {
    if (state.value.socketStatus === 'connected') {
      showLoadingStateUIInterval();
      sendMessageSocket('status', false);
    }
  }, [state.value.socketStatus]);

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
