import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/helpers';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, BookOpen, Search, Tag, X } from 'lucide-react';

const NOTE_COLORS = [
  'bg-white',
  'bg-yellow-50',
  'bg-sky-50',
  'bg-emerald-50',
  'bg-violet-50',
  'bg-rose-50',
];

const EMPTY_FORM = { title: '', content: '', tags: '', colorIdx: 0 };

export default function Notes() {
  const [notes, setNotes] = useLocalStorage('ssd_notes', []);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [viewNote, setViewNote] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((n) => (n.tags || []).forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [notes]);

  const openAddModal = () => {
    setEditNote(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditNote(note);
    setForm({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(', '),
      colorIdx: note.colorIdx ?? 0,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openViewModal = (note) => {
    setViewNote(note);
    setViewModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.content.trim()) errs.content = 'Content is required.';
    return errs;
  };

  const parseTags = (tagStr) =>
    tagStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const tags = parseTags(form.tags);
    if (editNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editNote.id
            ? { ...n, title: form.title, content: form.content, tags, colorIdx: form.colorIdx, updatedAt: new Date().toISOString() }
            : n
        )
      );
    } else {
      setNotes((prev) => [
        { id: generateId(), title: form.title, content: form.content, tags, colorIdx: form.colorIdx, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    setModalOpen(false);
  };

  const deleteNote = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchTag = !filterTag || (n.tags || []).includes(filterTag);
      return matchSearch && matchTag;
    });
  }, [notes, search, filterTag]);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Tag filter chips */}
      {filterTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            <Tag className="w-3 h-3" /> {filterTag}
            <button onClick={() => setFilterTag('')} className="ml-1 hover:text-indigo-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center text-slate-400">
          <BookOpen className="w-14 h-14 mb-3 text-violet-200" />
          <p className="text-base font-medium">No notes found</p>
          <p className="text-sm mt-1">{notes.length === 0 ? 'Create your first note!' : 'Try a different search or tag.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => openViewModal(note)}
              className={`group rounded-2xl border border-slate-200 shadow-sm p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-200 flex flex-col ${NOTE_COLORS[note.colorIdx ?? 0]}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 flex-1">{note.title}</h3>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(note); }}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                    aria-label="Edit note"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="p-1 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-500"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-4 flex-1 leading-relaxed">{note.content}</p>
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); setFilterTag(tag); }}
                      className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full cursor-pointer hover:bg-indigo-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editNote ? 'Edit Note' : 'New Note'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Note title..."
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder="Write your notes here..."
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-mono leading-relaxed ${errors.content ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. math, exam, chapter-3"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          {/* Note color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note Color</label>
            <div className="flex gap-2">
              {NOTE_COLORS.map((cls, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, colorIdx: i })}
                  className={`w-7 h-7 rounded-full border-2 ${cls} ${form.colorIdx === i ? 'border-indigo-600 scale-110' : 'border-slate-300'} transition-all`}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm">{editNote ? 'Save Changes' : 'Create Note'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title={viewNote?.title || ''} size="lg">
        {viewNote && (
          <div className="space-y-4">
            {viewNote.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {viewNote.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">{tag}</span>
                ))}
              </div>
            )}
            <div className="bg-slate-50 rounded-xl p-4 min-h-32">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{viewNote.content}</pre>
            </div>
            <p className="text-xs text-slate-400">
              Created {new Date(viewNote.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {viewNote.updatedAt && viewNote.updatedAt !== viewNote.createdAt && (
                <span> · Updated {new Date(viewNote.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              )}
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => { setViewModal(false); openEditModal(viewNote); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => setViewModal(false)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

