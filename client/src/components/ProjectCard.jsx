import { Link } from 'react-router-dom';

export default function ProjectCard({ project, currentUserId }) {
  const isAdmin = project.admin?._id === currentUserId;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink">{project.title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isAdmin ? 'bg-coral/10 text-coral' : 'bg-slate-100 text-slate-600'}`}>
          {isAdmin ? 'Admin' : 'Member'}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>
      <p className="mt-4 text-xs font-semibold text-slate-500">{project.members?.length || 0} members</p>
    </Link>
  );
}
