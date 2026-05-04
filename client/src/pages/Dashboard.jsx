import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const emptyProjectForm = { title: '', description: '', members: [] };
const statuses = ['Todo', 'In Progress', 'Completed'];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [filters, setFilters] = useState({ status: '', assignedTo: '' });

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [projectRes, taskRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/auth/users')
      ]);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = filters.status ? task.status === filters.status : true;
      const assignedMatch = filters.assignedTo ? task.assignedTo?._id === filters.assignedTo : true;
      return statusMatch && assignedMatch;
    });
  }, [tasks, filters]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const overdue = tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== 'Completed').length;
    const pending = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, progress };
  }, [tasks]);

  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status] = filteredTasks.filter((task) => task.status === status);
    return acc;
  }, {});

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/projects', projectForm);
      setProjects([data, ...projects]);
      setProjectForm(emptyProjectForm);
      setProjectModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map((task) => (task._id === taskId ? data : task)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Track active work, progress and overdue tasks.</p>
        </div>
        <button
          type="button"
          onClick={() => setProjectModalOpen(true)}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Create Project
        </button>
      </section>

      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Tasks', stats.total],
          ['Completed', stats.completed],
          ['Pending', stats.pending],
          ['Overdue', stats.overdue]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-ink">Overall Progress</h2>
            <p className="text-sm text-slate-500">{stats.progress}% completed</p>
          </div>
          <span className="text-sm font-bold text-brand">{stats.completed}/{stats.total}</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${stats.progress}%` }} />
        </div>
      </section>

      <section id="projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Projects</h2>
          <span className="text-sm text-slate-500">{projects.length} total</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} currentUserId={user._id} />
          ))}
          {!projects.length && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No projects yet. Create your first project to begin.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-xl font-bold text-ink">Tasks by Status</h2>
            <p className="text-sm text-slate-500">Filter by status or assigned member.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select
              value={filters.assignedTo}
              onChange={(event) => setFilters({ ...filters, assignedTo: event.target.value })}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All users</option>
              {users.map((member) => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <div key={status} className="min-h-56 rounded-lg border border-slate-200 bg-slate-100 p-3">
              <h3 className="px-1 pb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{status}</h3>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    canUpdate={task.assignedTo?._id === user._id}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {!groupedTasks[status].length && <p className="rounded-md bg-white p-4 text-sm text-slate-500">No tasks here.</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={projectModalOpen} title="Create Project" onClose={() => setProjectModalOpen(false)}>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input
              required
              value={projectForm.title}
              onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Description
            <textarea
              required
              rows="3"
              value={projectForm.description}
              onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Members
            <select
              multiple
              value={projectForm.members}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  members: Array.from(event.target.selectedOptions, (option) => option.value)
                })
              }
              className="mt-2 h-32 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            >
              {users
                .filter((member) => member._id !== user._id)
                .map((member) => (
                  <option key={member._id} value={member._id}>{member.name} - {member.email}</option>
                ))}
            </select>
          </label>
          <button type="submit" className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700">
            Save Project
          </button>
        </form>
      </Modal>
    </div>
  );
}
