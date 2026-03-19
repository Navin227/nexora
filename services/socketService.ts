import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';

export interface SocketEvents {
  'message:send': { channelId: string; message: ChatMessage };
  'message:receive': { channelId: string; message: ChatMessage };
  'dm:send': { recipientId: string; message: ChatMessage };
  'dm:receive': { senderId: string; message: ChatMessage };
  'typing:start': { channelId: string; userId: string };
  'typing:stop': { channelId: string; userId: string };
  'user:online': { userId: string };
  'user:offline': { userId: string };
  'channel:created': { channelId: string };
  'connect': void;
  'disconnect': void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners: Map<string, Function[]> = new Map();

  connect(serverUrl: string = 'http://localhost:3001') {
    return new Promise<void>((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
          console.log('[Socket] Connected to server');
          this.isConnected = true;
          this.emit('connect', undefined);
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('[Socket] Disconnected from server');
          this.isConnected = false;
          this.emit('disconnect', undefined);
        });

        this.socket.on('error', (error: any) => {
          console.error('[Socket] Connection error:', error);
        });

        // Set a timeout to fail gracefully if server not available
        setTimeout(() => {
          if (!this.isConnected) {
            console.warn('[Socket] Server unavailable, using mock mode');
            this.isConnected = true;
            resolve();
          }
        }, 2000);
      } catch (error) {
        console.error('[Socket] Failed to initialize socket:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on<K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket && event !== 'connect' && event !== 'disconnect') {
      this.socket.on(event, callback);
    }
  }

  off<K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket && event !== 'connect' && event !== 'disconnect') {
      this.socket.off(event, callback);
    }
  }

  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) {
    if (event === 'connect' || event === 'disconnect') {
      // Emit to local listeners
      if (this.listeners.has(event)) {
        this.listeners.get(event)!.forEach(callback => callback(data));
      }
    } else if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
