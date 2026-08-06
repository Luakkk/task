import { STATUS_LABELS, STATUS_SLUGS, Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

export function TaskColumn({ status, tasks, onChangeStatus, onDelete }: Props) {
  return (
    <div className={`task-column task-column--${STATUS_SLUGS[status]}`}>
      <h2 className="task-column__title">
        <span className="task-column__dot" />
        {STATUS_LABELS[status]}
        <span className="task-column__count">{tasks.length}</span>
      </h2>
      <div className="task-column__list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onChangeStatus={onChangeStatus} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && <p className="task-column__empty">No tasks</p>}
      </div>
    </div>
  );
}
