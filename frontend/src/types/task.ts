export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

/** The status a task moves to when you click "next" on its card. */
export function nextStatus(status: TaskStatus): TaskStatus | null {
  const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  const index = order.indexOf(status);
  return index < order.length - 1 ? order[index + 1] : null;
}
