type MessageHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:8002/ws';
  private subscribers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: any = null;
  private isIntentionalClose: boolean = false;
  public isConnected: boolean = false;
  private pingInterval: any = null;
  public latencyMs: number = 4;

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('STATUS', { connected: true });
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'PONG') {
            if (payload.timestamp) {
              this.latencyMs = Math.max(1, Math.round(performance.now() - payload.timestamp));
              this.emit('LATENCY_UPDATE', { latency: this.latencyMs });
            }
          } else {
            this.emit(payload.type, payload);
          }
        } catch {
          // Non-JSON message
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopPing();
        this.emit('STATUS', { connected: false });
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING', timestamp: performance.now() }));
      }
    }, 3000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  public subscribe(eventType: string, handler: MessageHandler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  private emit(eventType: string, data: any) {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (e) {
          console.error(`Error in WS handler for ${eventType}:`, e);
        }
      });
    }
  }

  public send(type: string, data?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
