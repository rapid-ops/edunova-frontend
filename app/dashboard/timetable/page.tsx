'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    class_id: '', course_id: '', teacher_id: '',
    day_of_week: 'Monday', start_time: '08:00', end_time: '09:00'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchTimetable(selectedClass);
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const [classesRes, coursesRes, usersRes] = await Promise.all([
        api.get('/classes/school/1'),
        api.get('/courses/school/1'),
        api.get('/auth/users/1'),
      ]);
      setClasses(classesRes.data.classes);
      setCourses(coursesRes.data.courses);
      setTeachers(usersRes.data.users.filter((u: any) => u.role === 'teacher'));
      if (classesRes.data.classes.length > 0) {
        setSelectedClass(String(classesRes.data.classes[0].id));
      }
    } catch (err) {}
  };

  const fetchTimetable = async (classId: string) => {
    try {
      const res = await api.get(`/timetable/class/${classId}`);
      setTimetable(res.data.timetable);
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/timetable', { ...form, school_id: 1, class_id: selectedClass });
      setShowForm(false);
      setForm({ class_id: '', course_id: '', teacher_id: '', day_of_week: 'Monday', start_time: '08:00', end_time: '09:00' });
      fetchTimetable(selectedClass);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable(selectedClass);
    } catch (err) {}
  };

  const grouped = DAYS.reduce((acc: any, day) => {
    acc[day] = timetable.filter((t) => t.day_of_week === day);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
          <h1 className="text-xl font-bold">Timetable</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-gray-900 text-sm px-4 py-2 rounded-lg"
        >
          + Add Entry
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <label className="text-gray-500 text-sm mb-1 block">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-semibold">New Timetable Entry</h2>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Day</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Course</label>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
                required
              >
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1 block">Teacher</label>
              <select
                value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-gray-500 text-sm mb-1 block">Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-500 text-sm mb-1 block">End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-6 py-2 rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {DAYS.map((day) => (
            <div key={day}>
              <h2 className="text-gray-500 text-sm font-medium mb-2">{day}</h2>
              {grouped[day].length === 0 ? (
                <p className="text-gray-700 text-sm px-2">No classes</p>
              ) : (
                <div className="space-y-2">
                  {grouped[day].map((t: any) => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.course_title}</p>
                        <p className="text-gray-500 text-sm">{t.start_time} — {t.end_time}</p>
                        {t.teacher_name && <p className="text-gray-500 text-xs mt-1">{t.teacher_name}</p>}
                      </div>
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
