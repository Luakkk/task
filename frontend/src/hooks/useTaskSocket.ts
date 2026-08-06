import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api/client';
import { TaskStatus } from '../types/task';

export interface TaskSocketEvent {
  id: string;
  status: TaskStatus;
  timestamp: string;
}

type TaskEventName = 'task:created' | 'task:updated' | 'task:deleted';

// Один сокет, слушает 3 события, переоткрывается, если поменялся токен
export function useTaskSocket(token: string | null, onEvent: (event: TaskEventName, payload: TaskSocketEvent) => void) {
  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(API_URL, { auth: { token } });

    const events: TaskEventName[] = ['task:created', 'task:updated', 'task:deleted'];
    events.forEach((event) => {
      socket.on(event, (payload: TaskSocketEvent) => onEvent(event, payload));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}
