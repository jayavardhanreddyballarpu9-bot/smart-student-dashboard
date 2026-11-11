import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, DAYS, SHORT_DAYS, EVENT_COLORS } from '../utils/helpers';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';

const EMPTY_FORM = {
  subject: '',
  room: '',
  professor: '',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  colorIdx: 0,
};

export default function Schedule() {
  const [events, setEvents] = useLocalStorage('ssd_schedule', []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const openAddModal = (day = 'Monday') => {
    setEditEvent(null);
    setForm({ ...EMPTY_FORM, day });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditEvent(ev);
    setForm({
      subject: ev.subject,
      room: ev.room || '',
      professor: ev.professor || '',
      day: ev.day,
      startTime: ev.startTime,
      endTime: ev.endTime,
      colorIdx: ev.colorIdx ?? 0,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (!form.endTime) errs.endTime = 'End time is required.';
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      errs.endTime = 'End time must be after start time.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (editEvent) {
      setEvents((prev) => prev.map((ev) => ev.id === editEvent.id ? { ...ev, ...form } : ev));
    } else {
      setEvents((prev) => [...prev, { id: generateId(), ...form }]);
    }
    setModalOpen(false);
  };

  const deleteEvent = (id) => {
    if (!window.confirm('Remove this class?')) return;
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const getEventsForDay = (day) =>
    events.filter((ev) => ev.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center text-slate-400">
          <CalendarDays className="w-14 h-14 mb-3 text-sky-200" />
          <p className="text-base font-medium">No classes scheduled</p>
          <p className="text-sm mt-1">Click "Add Class" to build your timetable.</p>
        </div>
      ) : (
        /* Weekly grid — responsive: scroll horizontally on mobile */
        <div className="overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-7 gap-3">
            {DAYS.map((day, di) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day} className="flex flex-col gap-2">
                  {/* Day header */}
                  <button
                    onClick={() => openAddModal(day)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-1 text-center group"
                    title={`Add class on ${day}`}
                  >
                    <p className="text-xs font-bold">{SHORT_DAYS[di]}</p>
                    <Plus className="w-3 h-3 mx-auto mt-0.5 opacity-60 group-hover:opacity-100" />
                  </button>

                  {/* Event cards */}
                  {dayEvents.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 py-4 text-center">
                      <p className="text-xs text-slate-300">Free</p>
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const c = EVENT_COLORS[ev.colorIdx % EVENT_COLORS.length];
                      return (
                        <div
                          key={ev.id}
                          className={`rounded-xl border p-2 ${c.bg} ${c.border} group relative`}
                        >
                          <p className={`text-xs font-bold ${c.text} truncate`}>{ev.subject}</p>
                          <p className={`text-xs ${c.text} opacity-75 mt-0.5`}>
                            {ev.startTime}–{ev.endTime}
                          </p>
                          {ev.room && <p className={`text-xs ${c.text} opacity-60 truncate`}>{ev.room}</p>}
                          {/* Actions on hover */}
                          <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                            <button
                              onClick={() => openEditModal(ev)}
                              className="p-0.5 rounded bg-white/60 hover:bg-white text-slate-600"
                              aria-label="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="p-0.5 rounded bg-white/60 hover:bg-white text-red-500"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editEvent ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Course <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Data Structures"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.subject ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room / Location</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. Hall A-101"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Professor</label>
              <input
                type="text"
                value={form.professor}
                onChange={(e) => setForm({ ...form, professor: e.target.value })}
                placeholder="e.g. Dr. Smith"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.startTime ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.endTime ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>
          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, colorIdx: i })}
                  className={`w-7 h-7 rounded-full border-2 ${c.bg} ${form.colorIdx === i ? 'border-indigo-600 scale-110' : 'border-transparent'} transition-all`}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm">
              {editEvent ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

