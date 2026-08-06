import { STATUS_LABELS, Task, TASK_STATUSES, TaskStatus } from '../types/task';

interface Props {
  task: Task;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onChangeStatus, onDelete }: Props) {
// Кнопка на каждый статус, кроме текущего, можно прыгнуть в любой, не только вперёд
  const otherStatuses = TASK_STATUSES.filter((status) => status !== task.status);

  return (
    <div className="task-card">
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__description">{task.description}</p>}
      <div className="task-card__actions">
        {otherStatuses.map((status) => (
          <button key={status} type="button" onClick={() => onChangeStatus(task, status)}>
            → {STATUS_LABELS[status]}
          </button>
        ))}
        <button type="button" className="task-card__delete" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );
}
