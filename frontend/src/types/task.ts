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

// STATUS_SLUGS для CSS-классов, STATUS_LABELS для текста на экране
export const STATUS_SLUGS: Record<TaskStatus, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
};
