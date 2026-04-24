import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';

let socketInstance = null;

export function getSocket() {
  return socketInstance;
}

export function useSocket({ onMessage, onNotification, onTyping, onPresence } = {}) {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io('http://localhost:8000', {
        auth: { token },
        transports: ['websocket'],
      });
    }
    socketRef.current = socketInstance;

    if (onMessage) socketInstance.on('new_message', onMessage);
    if (onNotification) socketInstance.on('notification', onNotification);
    if (onTyping) socketInstance.on('typing', onTyping);
    if (onPresence) socketInstance.on('presence', onPresence);

    return () => {
      if (onMessage) socketInstance.off('new_message', onMessage);
      if (onNotification) socketInstance.off('notification', onNotification);
      if (onTyping) socketInstance.off('typing', onTyping);
      if (onPresence) socketInstance.off('presence', onPresence);
    };
  }, [token]);

  return socketRef.current;
}

export function sendMessage(convId, text) {
  socketInstance?.emit('send_message', { convId, text });
}

export function joinConversation(convId) {
  socketInstance?.emit('join_conversation', convId);
}

export function typingStart(convId) {
  socketInstance?.emit('typing_start', convId);
}

export function typingStop(convId) {
  socketInstance?.emit('typing_stop', convId);
}

export function markRead(convId) {
  socketInstance?.emit('mark_read', convId);
}
