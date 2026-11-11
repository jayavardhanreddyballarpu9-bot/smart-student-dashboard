import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateGPA, formatDate, isPastDue, isToday } from '../utils/helpers';
import {
  ClipboardList,
  CalendarDays,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const [tasks] = useLocalStorage('ssd_tasks', []);
  const [scheduleEvents] = useLocalStorage('ssd_schedule', []);
  const [courses] = useLocalStorage('ssd_courses', []);
  const [notes] = useLocalStorage('ssd_notes', []);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => isPastDue(t.dueDate));
  const dueTodayTasks = pendingTasks.filter((t) => isToday(t.dueDate));
  const gpa = calculateGPA(courses);

  const stats = [
    {
      label: 'Pending Tasks',
      value: pendingTasks.length,
      sub: `${overdueTasks.length} overdue`,
      icon: ClipboardList,
      color: 'bg-indigo-50 text-indigo-600',
      iconBg: 'bg-indigo-100',
      link: '/tasks',
    },
    {
      label: 'Current GPA',
      value: gpa,
      sub: `${courses.length} course${courses.length !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
      link: '/grades',
    },
    {
      label: 'Class Slots',
      value: scheduleEvents.length,
      sub: 'this week',
      icon: CalendarDays,
      color: 'bg-sky-50 text-sky-600',
      iconBg: 'bg-sky-100',
      link: '/schedule',
    },
    {
      label: 'Notes',
      value: notes.length,
      sub: 'saved',
      icon: BookOpen,
      color: 'bg-violet-50 text-violet-600',
      iconBg: 'bg-violet-100',
      link: '/notes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Today */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Due Today</h2>
            <Link to="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {dueTodayTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
              <p className="text-sm">Nothing due today!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {dueTodayTasks.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'high'
                        ? 'bg-red-500'
                        : t.priority === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm text-slate-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-slate-400 capitalize px-2 py-0.5 rounded-full bg-slate-100">{t.subject}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Overdue Tasks</h2>
            <Link to="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {overdueTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
              <p className="text-sm">No overdue tasks! 🎉</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {overdueTasks.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-red-500">{formatDate(t.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Recent Notes</h2>
            <Link to="/notes" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {notes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <BookOpen className="w-10 h-10 mb-2 text-violet-300" />
              <p className="text-sm">No notes yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notes.slice(0, 4).map((n) => (
                <li
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <p className="text-sm font-medium text-slate-700 truncate">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.content}</p>
                  {n.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {n.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Course Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Course Averages</h2>
            <Link to="/grades" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <BarChart3 className="w-10 h-10 mb-2 text-emerald-300" />
              <p className="text-sm">No courses added yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {courses.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                    <span className="text-sm font-bold text-slate-800 ml-2">{(c.average ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        c.average >= 90
                          ? 'bg-emerald-500'
                          : c.average >= 70
                          ? 'bg-sky-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(c.average ?? 0, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
