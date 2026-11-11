import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, formatDate, isPastDue, isToday } from '../utils/helpers';
import Modal from '../components/Modal';
import {
  Plus,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const EMPTY_FORM = {
  title: '',
  subject: '',
  dueDate: '',
  priority: 'medium',
  description: '',
};

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage('ssd_tasks', []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | completed
  const [filterPriority, setFilterPriority] = useState('all');
  const [errors, setErrors] = useState({});

  const openAddModal = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      subject: task.subject || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'medium',
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (editTask) {
      setTasks((prev) => prev.map((t) => t.id === editTask.id ? { ...t, ...form } : t));
    } else {
      const newTask = { id: generateId(), completed: false, createdAt: new Date().toISOString(), ...form };
      setTasks((prev) => [newTask, ...prev]);
    }
    setModalOpen(false);
  };

  const toggleComplete = (id) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.subject || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'pending' && !t.completed) ||
        (filterStatus === 'completed' && t.completed);
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, filterStatus, filterPriority]);

  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', count: tasks.length, icon: Filter, color: 'text-slate-600' },
          { label: 'Pending', count: pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Completed', count: completed, icon: CheckCheck, color: 'text-emerald-600' },
          { label: 'Overdue', count: tasks.filter((t) => !t.completed && isPastDue(t.dueDate)).length, icon: AlertCircle, color: 'text-red-600' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-sm text-slate-500">{label}:</span>
            <span className={`text-sm font-bold ${color}`}>{count}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 mb-3 text-indigo-200" />
          <p className="text-base font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            {tasks.length === 0 ? 'Add your first task to get started!' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((task) => {
            const overdue = !task.completed && isPastDue(task.dueDate);
            const dueToday = !task.completed && isToday(task.dueDate);
            return (
              <li
                key={task.id}
                className={`bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-start gap-4
                  ${task.completed ? 'opacity-60 border-slate-100' : overdue ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}
                `}
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="mt-0.5 shrink-0"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {task.subject && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{task.subject}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : dueToday ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    aria-label="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'Add New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Math Assignment Chapter 5"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional notes about the task..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm"
            >
              {editTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

