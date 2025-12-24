// WebSocket service for real-time updates
class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  connect(endpoint, onMessage, onError = null, onClose = null) {
    const wsUrl = this.getWebSocketUrl(endpoint);
    
    if (this.connections.has(endpoint)) {
      console.log(`WebSocket already connected to ${endpoint}`);
      return this.connections.get(endpoint);
    }

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected to ${endpoint}`);
        this.reconnectAttempts.set(endpoint, 0);
        
        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
        
        ws.pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong') { // Don't log pong responses
            console.log(`WebSocket message from ${endpoint}:`, data);
          }
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error on ${endpoint}:`, error);
        if (onError) onError(error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed for ${endpoint}:`, event.code, event.reason);
        
        // Clear ping interval
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        
        this.connections.delete(endpoint);
        
        if (onClose) onClose(event);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect(endpoint, onMessage, onError, onClose);
        }
      };

      this.connections.set(endpoint, ws);
      return ws;
      
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${endpoint}:`, error);
      if (onError) onError(error);
      return null;
    }
  }

  attemptReconnect(endpoint, onMessage, onError, onClose) {
    const attempts = this.reconnectAttempts.get(endpoint) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.log(`Max reconnection attempts reached for ${endpoint}`);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
    console.log(`Attempting to reconnect to ${endpoint} in ${delay}ms (attempt ${attempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts.set(endpoint, attempts + 1);
      this.connect(endpoint, onMessage, onError, onClose);
    }, delay);
  }

  disconnect(endpoint) {
    const ws = this.connections.get(endpoint);
    if (ws) {
      ws.close(1000, 'Client disconnect');
      this.connections.delete(endpoint);
      this.reconnectAttempts.delete(endpoint);
    }
  }

  send(endpoint, data) {
    const ws = this.connections.get(endpoint);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    } else {
      console.warn(`WebSocket not connected to ${endpoint}`);
      return false;
    }
  }

  getWebSocketUrl(endpoint) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = baseUrl.replace(/^https?/, wsProtocol).replace('/api/v1/', '');
    return `${wsBaseUrl}/ws/${endpoint}/`;
  }

  // Convenience methods for specific endpoints
  connectToOrder(orderId, onMessage, onError, onClose) {
    return this.connect(`order/${orderId}`, onMessage, onError, onClose);
  }

  connectToRider(onMessage, onError, onClose) {
    return this.connect('rider', onMessage, onError, onClose);
  }

  connectToRestaurant(onMessage, onError, onClose) {
    return this.connect('restaurant', onMessage, onError, onClose);
  }

  // Send rider location update
  sendLocationUpdate(lat, lng, heading = null, speed = null, accuracy = null, isMoving = false) {
    return this.send('rider', {
      type: 'location_update',
      lat,
      lng,
      heading,
      speed,
      accuracy,
      is_moving: isMoving
    });
  }

  disconnectAll() {
    for (const endpoint of this.connections.keys()) {
      this.disconnect(endpoint);
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Clean up connections when page unloads
window.addEventListener('beforeunload', () => {
  webSocketService.disconnectAll();
});

export default webSocketService;