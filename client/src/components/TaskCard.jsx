const statusStyles = {
  Todo: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700'
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

export default function TaskCard({ task, canUpdate, onStatusChange }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-soft ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{task.title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
              {task.status}
            </span>
            {isOverdue && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Overdue</span>}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Project: {task.project?.title || 'Current project'}</span>
            <span>Assigned: {task.assignedTo?.name}</span>
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        </div>

        {canUpdate && (
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task._id, event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
          >
            <option>Todo</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        )}
      </div>
    </article>
  );
}
