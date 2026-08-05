import { apiClient } from './client';
import { Task, TaskStatus } from '../types/task';

export function fetchTasks() {
  return apiClient.get<Task[]>('/tasks').then((r) => r.data);
}

export function createTask(input: { title: string; description?: string }) {
  return apiClient.post<Task>('/tasks', input).then((r) => r.data);
}

export function updateTask(id: string, input: { title?: string; description?: string; status?: TaskStatus }) {
  return apiClient.patch<Task>(`/tasks/${id}`, input).then((r) => r.data);
}

export function deleteTask(id: string) {
  return apiClient.delete(`/tasks/${id}`);
}
