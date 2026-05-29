import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws-workforce';
console.log('Resolving WebSocket URL:', WS_BASE_URL);

export const useWebSocket = (topic: string, onMessage: (msg: any) => void) => {
  const stompClient = useRef<Stomp.Client | null>(null);

  const connect = useCallback(() => {
    // If the URL is relative, prepend the backend host (for dev)
    const url = WS_BASE_URL.startsWith('/') 
      ? `http://localhost:8080${WS_BASE_URL}` 
      : WS_BASE_URL;

    console.log('Attempting WebSocket connection to:', url);
    const socket = new SockJS(url);
    const client = Stomp.over(socket);
    client.debug = () => {}; // Mute debug logs

    client.connect({}, () => {
      client.subscribe(topic, (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          onMessage(payload);
        } catch (e) {
          // If not JSON, return as is
          onMessage(msg.body);
        }
      });
    }, (error) => {
      console.error('[WebSocket Error]', error);
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    });

    stompClient.current = client;
  }, [topic, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.disconnect(() => {});
      }
    };
  }, [connect]);

  const sendMessage = (destination: string, payload: any) => {
    if (stompClient.current?.connected) {
      stompClient.current.send(destination, {}, JSON.stringify(payload));
    }
  };

  return { sendMessage };
};
