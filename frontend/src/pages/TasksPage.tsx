import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { TaskColumn } from '../components/TaskColumn';
import { useAuth } from '../context/AuthContext';
import { useTaskSocket } from '../hooks/useTaskSocket';
import { getErrorMessage } from '../api/client';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { Task, TASK_STATUSES, TaskStatus } from '../types/task';

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
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create task'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangeStatus = async (task: Task, status: TaskStatus) => {
    await updateTask(task.id, { status });
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  return (
    <div className="tasks-page">
      <header className="tasks-page__header">
        <h1>
          <span className="brand-mark">Op</span>
          Tasks
        </h1>
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
        <button type="submit" className="btn-primary" disabled={isCreating}>
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
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
