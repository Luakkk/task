import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { TaskColumn } from '../components/TaskColumn';
import { useAuth } from '../context/AuthContext';
import { useTaskSocket } from '../hooks/useTaskSocket';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { nextStatus, Task, TASK_STATUSES } from '../types/task';

const TASKS_QUERY_KEY = ['tasks'];

export function TasksPage() {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
  });

  // Any real-time event just invalidates the list — the simplest correct
  // way to stay in sync with other tabs/browsers on the same account.
  useTaskSocket(token, () => {
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }
    setFormError(null);
    setIsCreating(true);
    try {
      await createTask({ title: title.trim() });
      setTitle('');
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    } catch (err: any) {
      setFormError(err.response?.data?.message?.[0] ?? 'Could not create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAdvance = async (task: Task) => {
    const next = nextStatus(task.status);
    if (!next) return;
    await updateTask(task.id, { status: next });
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  return (
    <div className="tasks-page">
      <header className="tasks-page__header">
        <h1>OpKit — Tasks</h1>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New task title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" disabled={isCreating}>
          Add task
        </button>
      </form>
      {formError && <p className="auth-form__error">{formError}</p>}

      {isLoading ? (
        <p>Loading tasks…</p>
      ) : (
        <div className="task-board">
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onAdvance={handleAdvance}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
