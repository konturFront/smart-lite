import { __DEV__ } from '../../global/value';
import { SocketService__Mock } from './socketService__Mock';

type MessageHandler = (data: any) => void;
type StatusHandler = (status: 'pending' | 'connected' | 'disconnected' | 'error') => void;
class SocketService {
  public socket: WebSocket | null = null;
  private messageSubscribers: MessageHandler[] = [];
  private statusSubscribers: StatusHandler[] = [];
  private messageQueue: string[] = [];
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;
  private pingIntervalMs = 5000;
  private reconnectInterval = 3000;
  private shouldReconnect = true;
  private enablePing = false; // Включать ли ping
  public url = '';

  connect(urlParams: string) {
    this.url = urlParams;
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) return;
    this.notifyStatus('pending');
    this.socket = new WebSocket(__DEV__ ? `ws://localhost:8080` : `ws://${this.url}:81`);

    this.socket.onopen = () => {
      this.clearPing();
      if (this.enablePing) {
        this.pingIntervalId = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, this.pingIntervalMs);
      }

      this.notifyStatus('connected');

      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) {
          this.socket.send(msg);
        }
      }
    };

    this.socket.onclose = () => {
      this.notifyStatus('disconnected');
      this.clearPing();
      this.scheduleReconnect(this.url);
    };

    this.socket.onerror = () => {
      this.notifyStatus('error');
      this.clearPing();
      this.scheduleReconnect(this.url);
    };

    this.socket.onmessage = event => {
      let data: any;
      try {
        data = typeof data === 'string' ? data : JSON.parse(event.data);
      } catch (error) {
        console.warn('[SocketService] Failed to parse message:', error);
        data = event.data;
      }

      this.messageSubscribers.forEach(cb => cb(data));
    };
  }

  send(data: Record<string | number, unknown> | string) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  onMessage(cb: MessageHandler): () => void {
    this.messageSubscribers.push(cb);
    return () => {
      this.messageSubscribers = this.messageSubscribers.filter(fn => fn !== cb);
    };
  }

  onStatus(cb: StatusHandler): () => void {
    this.statusSubscribers.push(cb);
    return () => {
      this.statusSubscribers = this.statusSubscribers.filter(fn => fn !== cb);
    };
  }

  private notifyStatus(status: 'connected' | 'disconnected' | 'error' | 'pending') {
    this.statusSubscribers.forEach(cb => cb(status));
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearPing();
    this.clearReconnect();
    this.socket?.close();
    this.socket = null;
    this.messageSubscribers = [];
    this.statusSubscribers = [];
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(url: string) {
    if (!this.shouldReconnect) return;
    this.clearReconnect();
    this.reconnectTimeout = setTimeout(() => {
      console.warn('[SocketService] Reconnecting...');
      this.socket = null;
      this.connect(url);
    }, this.reconnectInterval);
  }

  reconnect(newUrl?: string) {
    this.url = newUrl || this.url;
    this.shouldReconnect = false; // отключаем автопереподключение временно
    this.clearPing();
    this.clearReconnect();

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.close(); // закроем соединение
      this.socket = null;
    }

    // включаем ручное переподключение
    this.shouldReconnect = true;
    this.connect(newUrl);
  }

  private clearPing() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private clearReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const socketService = __DEV__ ? new SocketService__Mock() : new SocketService();
