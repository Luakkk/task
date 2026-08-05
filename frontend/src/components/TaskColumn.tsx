import { STATUS_LABELS, Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onAdvance: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskColumn({ status, tasks, onAdvance, onDelete }: Props) {
  return (
    <div className="task-column">
      <h2 className="task-column__title">
        {STATUS_LABELS[status]} <span className="task-column__count">{tasks.length}</span>
      </h2>
      <div className="task-column__list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onAdvance={onAdvance} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && <p className="task-column__empty">No tasks</p>}
      </div>
    </div>
  );
}
