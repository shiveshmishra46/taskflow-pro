import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const emptyTaskForm = {
  title: '',
  description: '',
  assignedTo: '',
  status: 'Todo',
  dueDate: ''
};

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [newMemberId, setNewMemberId] = useState('');
  const [filters, setFilters] = useState({ status: '', assignedTo: '' });

  const isAdmin = project?.admin?._id === user._id;
  const availableUsers = users.filter((item) => !project?.members?.some((member) => member._id === item._id));

  const fetchProject = async () => {
    setLoading(true);
    setError('');

    try {
      const [projectRes, userRes] = await Promise.all([api.get(`/projects/${id}`), api.get('/auth/users')]);
      setProject(projectRes.data.project);
      setTasks(projectRes.data.tasks);
      setUsers(userRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = filters.status ? task.status === filters.status : true;
      const assignedMatch = filters.assignedTo ? task.assignedTo?._id === filters.assignedTo : true;
      return statusMatch && assignedMatch;
    });
  }, [tasks, filters]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/tasks', { ...taskForm, project: id });
      setTasks([...tasks, data]);
      setTaskForm(emptyTaskForm);
      setTaskModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task');
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

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!newMemberId) return;

    try {
      const { data } = await api.post(`/projects/${id}/members`, { userId: newMemberId });
      setProject(data);
      setNewMemberId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const { data } = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(data);
      setTasks(tasks.filter((task) => task.assignedTo?._id !== memberId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove member');
    }
  };

  if (loading) return <Loader />;

  if (!project) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-brand">Back to Dashboard</Link>
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{project.title}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isAdmin ? 'bg-coral/10 text-coral' : 'bg-slate-100 text-slate-600'}`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{project.description}</p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setTaskForm({ ...emptyTaskForm, assignedTo: project.members[0]?._id || '' });
                setTaskModalOpen(true);
              }}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Task
            </button>
          )}
        </div>
      </section>

      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-ink">Members</h2>
            <div className="mt-4 space-y-3">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>
                  </div>
                  {isAdmin && member._id !== project.admin._id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <form onSubmit={handleAddMember} className="mt-4 space-y-3">
                <select
                  value={newMemberId}
                  onChange={(event) => setNewMemberId(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select user to add</option>
                  {availableUsers.map((member) => (
                    <option key={member._id} value={member._id}>{member.name} - {member.email}</option>
                  ))}
                </select>
                <button type="submit" className="w-full rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Add Member
                </button>
              </form>
            )}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-bold text-ink">Project Tasks</h2>
              <p className="text-sm text-slate-500">{filteredTasks.length} visible tasks</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All statuses</option>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select
                value={filters.assignedTo}
                onChange={(event) => setFilters({ ...filters, assignedTo: event.target.value })}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All assignees</option>
                {project.members.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                canUpdate={task.assignedTo?._id === user._id}
                onStatusChange={handleStatusChange}
              />
            ))}
            {!filteredTasks.length && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No tasks match the selected filters.
              </div>
            )}
          </div>
        </section>
      </section>

      <Modal open={taskModalOpen} title="Create Task" onClose={() => setTaskModalOpen(false)}>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input
              required
              value={taskForm.title}
              onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Description
            <textarea
              required
              rows="3"
              value={taskForm.description}
              onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Assigned user
              <select
                required
                value={taskForm.assignedTo}
                onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
              >
                {project.members.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Status
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            Due date
            <input
              required
              type="date"
              value={taskForm.dueDate}
              onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button type="submit" className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700">
            Save Task
          </button>
        </form>
      </Modal>
    </div>
  );
}
