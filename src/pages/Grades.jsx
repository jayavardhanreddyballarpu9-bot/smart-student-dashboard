import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, letterGrade, calculateGPA } from '../utils/helpers';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';

const EMPTY_COURSE_FORM = { name: '', credits: 3 };
const EMPTY_GRADE_FORM = { name: '', score: '', maxScore: 100, weight: 1 };

export default function Grades() {
  const [courses, setCourses] = useLocalStorage('ssd_courses', []);
  const [courseModal, setCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE_FORM);
  const [courseErrors, setCourseErrors] = useState({});

  const [gradeModal, setGradeModal] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [editGrade, setEditGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState(EMPTY_GRADE_FORM);
  const [gradeErrors, setGradeErrors] = useState({});

  const [expandedCourse, setExpandedCourse] = useState(null);

  // --- Course CRUD ---
  const openAddCourse = () => {
    setEditCourse(null);
    setCourseForm(EMPTY_COURSE_FORM);
    setCourseErrors({});
    setCourseModal(true);
  };

  const openEditCourse = (course) => {
    setEditCourse(course);
    setCourseForm({ name: course.name, credits: course.credits });
    setCourseErrors({});
    setCourseModal(true);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!courseForm.name.trim()) errs.name = 'Course name is required.';
    if (Object.keys(errs).length) { setCourseErrors(errs); return; }

    if (editCourse) {
      setCourses((prev) =>
        prev.map((c) => c.id === editCourse.id ? { ...c, name: courseForm.name, credits: Number(courseForm.credits) } : c)
      );
    } else {
      setCourses((prev) => [...prev, { id: generateId(), name: courseForm.name, credits: Number(courseForm.credits), grades: [], average: 0 }]);
    }
    setCourseModal(false);
  };

  const deleteCourse = (id) => {
    if (!window.confirm('Delete this course and all its grades?')) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Grade CRUD ---
  const openAddGrade = (courseId) => {
    setActiveCourseId(courseId);
    setEditGrade(null);
    setGradeForm(EMPTY_GRADE_FORM);
    setGradeErrors({});
    setGradeModal(true);
  };

  const openEditGrade = (courseId, grade) => {
    setActiveCourseId(courseId);
    setEditGrade(grade);
    setGradeForm({ name: grade.name, score: grade.score, maxScore: grade.maxScore, weight: grade.weight });
    setGradeErrors({});
    setGradeModal(true);
  };

  const computeAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const totalWeight = grades.reduce((sum, g) => sum + Number(g.weight), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100 * Number(g.weight), 0);
    return weightedSum / totalWeight;
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!gradeForm.name.trim()) errs.name = 'Assignment name is required.';
    if (gradeForm.score === '' || isNaN(gradeForm.score)) errs.score = 'Score is required.';
    if (Number(gradeForm.score) < 0 || Number(gradeForm.score) > Number(gradeForm.maxScore))
      errs.score = `Score must be between 0 and ${gradeForm.maxScore}.`;
    if (Object.keys(errs).length) { setGradeErrors(errs); return; }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== activeCourseId) return c;
        let grades;
        if (editGrade) {
          grades = c.grades.map((g) =>
            g.id === editGrade.id ? { ...g, ...gradeForm, score: Number(gradeForm.score), maxScore: Number(gradeForm.maxScore), weight: Number(gradeForm.weight) } : g
          );
        } else {
          grades = [...(c.grades || []), { id: generateId(), ...gradeForm, score: Number(gradeForm.score), maxScore: Number(gradeForm.maxScore), weight: Number(gradeForm.weight) }];
        }
        return { ...c, grades, average: computeAverage(grades) };
      })
    );
    setGradeModal(false);
  };

  const deleteGrade = (courseId, gradeId) => {
    if (!window.confirm('Remove this grade entry?')) return;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const grades = c.grades.filter((g) => g.id !== gradeId);
        return { ...c, grades, average: computeAverage(grades) };
      })
    );
  };

  const gpa = calculateGPA(courses);

  return (
    <div className="space-y-5">
      {/* GPA Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium opacity-80">Cumulative GPA</p>
        <p className="text-5xl font-bold mt-1">{gpa}</p>
        <p className="text-sm opacity-70 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} tracked</p>
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        <button
          onClick={openAddCourse}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Course list */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center text-slate-400">
          <BarChart3 className="w-14 h-14 mb-3 text-emerald-200" />
          <p className="text-base font-medium">No courses yet</p>
          <p className="text-sm mt-1">Add a course to start tracking your grades.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const { letter, color } = letterGrade(course.average ?? 0);
            const isExpanded = expandedCourse === course.id;
            return (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Course header */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <button
                    onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{course.name}</p>
                    <p className="text-xs text-slate-400">{course.credits} credit{course.credits !== 1 ? 's' : ''} · {course.grades?.length ?? 0} grade{course.grades?.length !== 1 ? 's' : ''}</p>
                  </div>
                  {/* Average bar */}
                  <div className="hidden sm:flex items-center gap-3 w-40">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${course.average >= 90 ? 'bg-emerald-500' : course.average >= 70 ? 'bg-sky-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(course.average ?? 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-10 text-right">{(course.average ?? 0).toFixed(1)}%</span>
                  </div>
                  <span className={`text-lg font-bold ${color} w-6 text-center`}>{letter}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openAddGrade(course.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Add grade">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditCourse(course)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Edit course">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCourse(course.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Delete course">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grade entries (expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-4 pt-3">
                    {!course.grades || course.grades.length === 0 ? (
                      <p className="text-sm text-slate-400 py-2">No grades yet. Click <strong>+</strong> to add one.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                            <th className="text-left pb-2">Assignment</th>
                            <th className="text-right pb-2">Score</th>
                            <th className="text-right pb-2">%</th>
                            <th className="text-right pb-2">Weight</th>
                            <th className="text-right pb-2">Grade</th>
                            <th className="text-right pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.grades.map((g) => {
                            const pct = (Number(g.score) / Number(g.maxScore)) * 100;
                            const { letter: gl, color: gc } = letterGrade(pct);
                            return (
                              <tr key={g.id} className="border-b border-slate-50 last:border-0">
                                <td className="py-2 font-medium text-slate-700">{g.name}</td>
                                <td className="py-2 text-right text-slate-600">{g.score}/{g.maxScore}</td>
                                <td className="py-2 text-right text-slate-600">{pct.toFixed(1)}%</td>
                                <td className="py-2 text-right text-slate-500">×{g.weight}</td>
                                <td className={`py-2 text-right font-bold ${gc}`}>{gl}</td>
                                <td className="py-2 text-right">
                                  <div className="flex items-center justify-end gap-0.5">
                                    <button onClick={() => openEditGrade(course.id, g)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => deleteGrade(course.id, g.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Course Modal */}
      <Modal open={courseModal} onClose={() => setCourseModal(false)} title={editCourse ? 'Edit Course' : 'Add Course'} size="sm">
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              placeholder="e.g. Introduction to Algorithms"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${courseErrors.name ? 'border-red-400' : 'border-slate-200'}`}
            />
            {courseErrors.name && <p className="text-red-500 text-xs mt-1">{courseErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
            <input
              type="number"
              min={1}
              max={12}
              value={courseForm.credits}
              onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCourseModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm">{editCourse ? 'Save' : 'Add Course'}</button>
          </div>
        </form>
      </Modal>

      {/* Grade Modal */}
      <Modal open={gradeModal} onClose={() => setGradeModal(false)} title={editGrade ? 'Edit Grade' : 'Add Grade'} size="sm">
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={gradeForm.name}
              onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
              placeholder="e.g. Midterm Exam"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${gradeErrors.name ? 'border-red-400' : 'border-slate-200'}`}
            />
            {gradeErrors.name && <p className="text-red-500 text-xs mt-1">{gradeErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Score <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                max={gradeForm.maxScore}
                step="0.01"
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                placeholder="e.g. 85"
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${gradeErrors.score ? 'border-red-400' : 'border-slate-200'}`}
              />
              {gradeErrors.score && <p className="text-red-500 text-xs mt-1">{gradeErrors.score}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={gradeForm.maxScore}
                onChange={(e) => setGradeForm({ ...gradeForm, maxScore: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weight</label>
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={gradeForm.weight}
              onChange={(e) => setGradeForm({ ...gradeForm, weight: e.target.value })}
              placeholder="e.g. 1 or 0.3 for 30%"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <p className="text-xs text-slate-400 mt-1">Use relative weights (e.g. 1 = normal, 2 = double weight)</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setGradeModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm">{editGrade ? 'Save' : 'Add Grade'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
