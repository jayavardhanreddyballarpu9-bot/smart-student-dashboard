/**
 * Generate a unique ID string.
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Returns true if a date string represents a past date.
 */
export function isPastDue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') < today;
}

/**
 * Returns true if a date string is today.
 */
export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

/**
 * Calculate letter grade from percentage score.
 */
export function letterGrade(score) {
  if (score >= 90) return { letter: 'A', color: 'text-green-600' };
  if (score >= 80) return { letter: 'B', color: 'text-blue-600' };
  if (score >= 70) return { letter: 'C', color: 'text-yellow-600' };
  if (score >= 60) return { letter: 'D', color: 'text-orange-600' };
  return { letter: 'F', color: 'text-red-600' };
}

/**
 * Calculate GPA from a list of courses (each with a numeric average 0-100).
 */
export function calculateGPA(courses) {
  if (!courses || courses.length === 0) return '0.00';
  const gpas = courses.map((c) => {
    const avg = c.average ?? 0;
    if (avg >= 93) return 4.0;
    if (avg >= 90) return 3.7;
    if (avg >= 87) return 3.3;
    if (avg >= 83) return 3.0;
    if (avg >= 80) return 2.7;
    if (avg >= 77) return 2.3;
    if (avg >= 73) return 2.0;
    if (avg >= 70) return 1.7;
    if (avg >= 67) return 1.3;
    if (avg >= 63) return 1.0;
    if (avg >= 60) return 0.7;
    return 0.0;
  });
  const gpa = gpas.reduce((a, b) => a + b, 0) / gpas.length;
  return gpa.toFixed(2);
}

/**
 * Days of the week for the schedule grid.
 */
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Short day labels.
 */
export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Color classes for schedule events (cycling through).
 */
export const EVENT_COLORS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
];

