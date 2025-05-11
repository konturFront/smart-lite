import { useEffect } from 'preact/hooks';
import { socketService } from '../../service/ws/socketService';
import { Header } from '../Header/Header';
import { Wrapper } from '../Wrapper/Wrapper';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { ToastProvider } from '../Toast/Toast';
import { state, stateUI } from '../../store/initialState';
import { Loader } from '../Loader/Loader';
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
        <ToastProvider />
        {stateUI.value.isLoadingUI && <Loader />}
      </div>
    );
  }

  if (!isMobile) {
    return <div style={{ fontSize: '40px' }}>Only Mobile Version</div>;
  }
};
