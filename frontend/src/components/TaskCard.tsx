import { nextStatus, Task } from '../types/task';

interface Props {
  task: Task;
  onAdvance: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onAdvance, onDelete }: Props) {
  const next = nextStatus(task.status);

  return (
    <div className="task-card">
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__description">{task.description}</p>}
      <div className="task-card__actions">
        {next && (
          <button type="button" onClick={() => onAdvance(task)}>
            → {next.replace('_', ' ')}
          </button>
        )}
        <button type="button" className="task-card__delete" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );
}
